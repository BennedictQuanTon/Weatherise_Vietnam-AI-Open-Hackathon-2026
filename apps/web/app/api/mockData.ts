// Demo engine — one mock report per showcase question.
// All numbers come from lib/report/demoWeek.ts; checks are computed, not typed in.

import type {
  CalendarDay,
  Cell,
  ChartSpec,
  Report,
  ReportMarker,
  TripDay,
  TripStop,
} from "@/lib/report/types";
import {
  AS_OF,
  HOURLY,
  HOURLY_ORDER,
  MODEL,
  NB,
  PIPELINE_BASE,
  RULES,
  WEATHER_SOURCES,
  WEEK,
  day,
  firstRainAfter,
  hh,
  hourlyPoints,
  hoursBetween,
  max,
  min,
  range,
  round,
  slice,
  span,
  sum,
  unit,
  type HourlyKey,
} from "@/lib/report/demoWeek";
import { SHOWCASE_PROMPTS } from "@/lib/report/prompts";

export interface ChatResult {
  session_id: string;
  status: string;
  response_type: "trip_planning" | "weather_prediction" | "general";
  domain: string;
  location: string;
  coordinates?: { latitude: number; longitude: number };
  report: Report;
}

const pass = (ok: boolean) => (ok ? "Pass" : "Fail");
const cell = (text: string, ok?: boolean): Cell => ({
  text,
  tone: ok === undefined ? "neutral" : ok ? "ok" : "alert",
});

// ─────────────────────────────────────────────────────────────────────────────
// 1. TOURISM — 3-day Da Nang & Hoi An trip with local specialties
// ─────────────────────────────────────────────────────────────────────────────

interface StopSeed {
  hour: number;
  time: string;
  name: string;
  area: string;
  kind: TripStop["kind"];
  indoor: boolean;
  note: string;
  specialty?: string;
  limits?: { rain: number; wind: number };
  moved?: string;
  lat: number;
  lon: number;
}

const TRIP: { key: HourlyKey; title: string; summary: string; stops: StopSeed[] }[] = [
  {
    key: "thu",
    title: "Son Tra & My Khe Beach",
    summary: "Clear and hot. Outdoor stops sit before 10:00 and after 16:00; rest indoors through the 33 °C midday peak.",
    stops: [
      { hour: 6, time: "06:30", name: "My Khe Fish Cake Noodles", area: "My Khe", kind: "food", indoor: true, specialty: "Bún Chả Cá", note: "Fish cake noodle soup, Da Nang's signature breakfast.", lat: 16.0511, lon: 108.2468 },
      { hour: 8, time: "08:00", name: "Son Tra Peninsula & Linh Ung Pagoda", area: "Son Tra", kind: "sight", indoor: false, limits: { rain: 55, wind: 35 }, note: "Lady Buddha viewpoint and coastal road while it is still cool.", lat: 16.0989, lon: 108.2762 },
      { hour: 11, time: "11:30", name: "Tran Specialty Kitchen", area: "Hai Chau", kind: "food", indoor: true, specialty: "Bánh Tráng Cuốn Thịt Heo", note: "Pork and herb rice-paper rolls; air-conditioned, sit out the heat.", lat: 16.0605, lon: 108.221 },
      { hour: 16, time: "16:00", name: "My Khe Beach", area: "My Khe", kind: "beach", indoor: false, limits: { rain: 50, wind: 35 }, note: "Swim once the heat drops; wind 14 km/h is swim-safe.", lat: 16.0481, lon: 108.2478 },
      { hour: 18, time: "18:30", name: "Tran Seafood Restaurant", area: "My An", kind: "food", indoor: false, specialty: "Fresh Seafood", note: "Pick-your-own seafood on the beachfront.", lat: 16.0423, lon: 108.2461 },
      { hour: 20, time: "20:00", name: "Dragon Bridge", area: "Han River", kind: "sight", indoor: false, limits: { rain: 80, wind: 40 }, note: "Night walk along the Han River; the fire show runs Sat–Sun only.", lat: 16.0607, lon: 108.2272 },
    ],
  },
  {
    key: "fri",
    title: "Marble Mountains & City Center",
    summary: "Thunderstorms 13:00–17:00. Marble Mountains moves to the dry morning; the afternoon is all indoor.",
    stops: [
      { hour: 7, time: "07:00", name: "Ba Mua Mi Quang", area: "Hai Chau", kind: "food", indoor: true, specialty: "Mì Quảng", note: "Turmeric noodles with shrimp and pork, the Quang Nam classic.", lat: 16.0721, lon: 108.2215 },
      { hour: 8, time: "08:30", name: "Marble Mountains", area: "Ngu Hanh Son", kind: "sight", indoor: false, limits: { rain: 60, wind: 40 }, moved: "Moved from 14:00", note: "Caves and pagodas before the storm builds.", lat: 16.0013, lon: 108.2621 },
      { hour: 11, time: "11:30", name: "Non Nuoc Specialty Restaurant", area: "Ngu Hanh Son", kind: "food", indoor: true, specialty: "Gỏi Cá Nam Ô", note: "Nam O raw fish salad with herbs and rice paper.", lat: 16.0075, lon: 108.2588 },
      { hour: 13, time: "13:30", name: "Museum of Cham Sculpture", area: "Hai Chau", kind: "museum", indoor: true, note: "The world's largest Cham collection; fully covered during the storm.", lat: 16.0668, lon: 108.2237 },
      { hour: 15, time: "15:30", name: "Han Market", area: "Hai Chau", kind: "market", indoor: true, note: "Covered market for dried seafood, coffee and souvenirs.", lat: 16.0749, lon: 108.2233 },
      { hour: 18, time: "18:30", name: "Ba Duong Banh Xeo", area: "Hai Chau", kind: "food", indoor: true, specialty: "Bánh Xèo", note: "Crispy rice pancakes with nem lụi skewers, after the rain clears.", lat: 16.0545, lon: 108.216 },
    ],
  },
  {
    key: "sat",
    title: "Hoi An Ancient Town",
    summary: "Partly cloudy and dry. A 45-minute drive south; old town in the morning, river and lanterns late in the day.",
    stops: [
      { hour: 7, time: "07:00", name: "Banh My Ba Lan", area: "Hai Chau", kind: "food", indoor: false, specialty: "Bánh Mì", note: "Grab-and-go breakfast before the drive to Hoi An.", lat: 16.0712, lon: 108.2201 },
      { hour: 9, time: "09:00", name: "Hoi An Ancient Town", area: "Hoi An", kind: "sight", indoor: false, limits: { rain: 60, wind: 40 }, note: "Japanese Bridge and merchant houses before 10:00 heat.", lat: 15.8775, lon: 108.3279 },
      { hour: 11, time: "11:30", name: "Cao Lau Thanh", area: "Hoi An", kind: "food", indoor: true, specialty: "Cao Lầu", note: "Hoi An's chewy noodles with pork and crackling.", lat: 15.8786, lon: 108.333 },
      { hour: 15, time: "15:30", name: "Thu Bon River Boat", area: "Hoi An", kind: "river", indoor: false, limits: { rain: 50, wind: 30 }, note: "Covered boats; a light shower (0.6 mm) is possible around 15:00.", lat: 15.876, lon: 108.329 },
      { hour: 17, time: "17:30", name: "Com Ga Ba Buoi", area: "Hoi An", kind: "food", indoor: true, specialty: "Cơm Gà Hội An", note: "Shredded chicken rice, a Hoi An institution.", lat: 15.879, lon: 108.3305 },
      { hour: 19, time: "19:00", name: "Hoi An Night Market & Lanterns", area: "Hoi An", kind: "sight", indoor: false, limits: { rain: 60, wind: 40 }, note: "Release a river lantern; rain chance is 10%.", lat: 15.8762, lon: 108.3268 },
    ],
  },
];

function tripStop(key: HourlyKey, s: StopSeed): TripStop {
  const h = HOURLY[key];
  const temp = round(h.temp[s.hour]);
  const rain = h.rainProb[s.hour];
  const wind = h.wind[s.hour];
  const ok = s.indoor || !s.limits || (rain <= s.limits.rain && wind <= s.limits.wind);
  return {
    time: s.time,
    name: s.name,
    area: s.area,
    kind: s.kind,
    indoor: s.indoor,
    note: s.note,
    specialty: s.specialty,
    moved: s.moved,
    forecast: `${unit(temp, "°C")} · ${rain}% rain`,
    tone: ok ? "ok" : "alert",
    lat: s.lat,
    lon: s.lon,
  };
}

function hoursWhere(test: (h: number) => boolean, from = 6, to = 22) {
  const out: number[] = [];
  for (let h = from; h <= to; h++) if (test(h)) out.push(h);
  return out;
}

function tripCharts(key: HourlyKey): ChartSpec[] {
  const h = HOURLY[key];
  const storm = hoursWhere((x) => h.lightning.includes(x));
  const heat = hoursWhere((x) => h.temp[x] >= RULES.tourism.heatHigh);
  const stormBand = storm.length
    ? [{ from: storm[0] - 6, to: storm[storm.length - 1] + 1 - 6, label: "Thunderstorm", tone: "alert" as const }]
    : [];
  const heatBand = heat.length
    ? [{ from: heat[0] - 6, to: heat[heat.length - 1] + 1 - 6, label: `Heat ${unit(RULES.tourism.heatHigh, "°C")}`, tone: "caution" as const }]
    : [];
  return [
    {
      title: "Rain Chance",
      unit: "%",
      kind: "bar",
      points: hourlyPoints("rainProb", { key, hour: 6 }, { key, hour: 22 }),
      max: 100,
      threshold: { value: RULES.tourism.rainReschedule, label: "Move indoors above 60%" },
      bands: stormBand,
      tickEvery: 2,
    },
    {
      title: "Temperature",
      unit: "°C",
      kind: "line",
      points: hourlyPoints("temp", { key, hour: 6 }, { key, hour: 22 }),
      min: 22,
      max: 36,
      decimals: 1,
      threshold: { value: RULES.tourism.heatHigh, label: "High heat 33 °C" },
      bands: [...stormBand, ...heatBand],
      tickEvery: 2,
    },
  ];
}

export function getTourismMockResponse(): ChatResult {
  const days: TripDay[] = TRIP.map((t, i) => {
    const d = day(t.key);
    return {
      day: i + 1,
      date: d.label,
      title: t.title,
      summary: t.summary,
      condition: d.condition,
      high: d.high,
      low: d.low,
      peakRain: d.rainPeak,
      uv: d.uv,
      charts: tripCharts(t.key),
      stops: t.stops.map((s) => tripStop(t.key, s)),
    };
  });

  const tripDays = TRIP.map((t) => day(t.key));
  const hottest = tripDays.reduce((a, b) => (b.high > a.high ? b : a));
  const wettest = tripDays.reduce((a, b) => (b.rainPeak > a.rainPeak ? b : a));
  const fri = HOURLY.fri;
  const peakRainHour = fri.rainProb.indexOf(max(fri.rainProb));
  const storm = fri.lightning;
  const stormWindow = `${hh(storm[0])}–${hh(storm[storm.length - 1] + 1)}`;
  const beachWind = HOURLY.thu.wind[16];
  const uvPeak = max(tripDays.map((d) => d.uv));
  const dryDays = tripDays.filter((d) => d.rainPeak <= RULES.tourism.rainSafe);

  // Outdoor stop check, including the slot the planner rejected.
  const marbleAt14 = HOURLY.fri.rainProb[14];
  const outdoorRows: Cell[][] = [];
  TRIP.forEach((t) => {
    t.stops
      .filter((s) => !s.indoor && s.limits)
      .forEach((s) => {
        const r = HOURLY[t.key].rainProb[s.hour];
        const w = HOURLY[t.key].wind[s.hour];
        const ok = r <= s.limits!.rain && w <= s.limits!.wind;
        outdoorRows.push([
          cell(s.name),
          cell(`${day(t.key).short} ${s.time}`),
          cell(`Rain ≤ ${s.limits!.rain}% · Wind ≤ ${unit(s.limits!.wind, "km/h")}`),
          cell(`${r}% · ${unit(w, "km/h")}`),
          cell(pass(ok), ok),
        ]);
        if (s.moved) {
          outdoorRows.push([
            cell(`${s.name} (original slot)`),
            cell("Fri 14:00"),
            cell(`Rain ≤ ${s.limits!.rain}% · Wind ≤ ${unit(s.limits!.wind, "km/h")}`),
            cell(`${marbleAt14}% · ${unit(HOURLY.fri.wind[14], "km/h")}`),
            cell("Fail · Moved", false),
          ]);
        }
      });
  });

  const markers: ReportMarker[] = days.flatMap((d) =>
    d.stops.map((s, i) => ({
      id: `d${d.day}-${i}`,
      lat: s.lat,
      lon: s.lon,
      label: String(i + 1),
      title: `${s.time} · ${s.name}`,
      detail: s.specialty ? `Try: ${s.specialty}` : s.forecast,
      tone: s.indoor ? ("neutral" as const) : s.tone,
      day: d.day,
    })),
  );

  const report: Report = {
    domain: "tourism",
    as_of: AS_OF,
    title: "3-Day Trip: Da Nang & Hoi An",
    prompt: SHOWCASE_PROMPTS.tourism,
    location: "Da Nang & Hoi An",
    parsed: [
      { label: "Domain", value: "Tourism" },
      { label: "Where", value: "Da Nang, Hoi An" },
      { label: "When", value: `${tripDays[0].label} – ${tripDays[2].label.split(", ")[1]}` },
      { label: "Wants", value: "Weather check · Day plan · Local food" },
    ],
    asks: ["Is the weather good?", "Plan each day", "Local specialties"],
    verdict: {
      tone: "ok",
      label: "Good to Go",
      headline: `Yes — all 3 days work. ${wettest.short} afternoon has thunderstorms, so that block is indoors.`,
      reasons: [
        `${dryDays.map((d) => d.short).join(" & ")}: dry, ${range(min(tripDays.map((d) => d.low)), hottest.high, "°C")}, rain ≤ ${max(dryDays.map((d) => d.rainPeak))}%.`,
        `${wettest.short} ${stormWindow}: thunderstorms (${wettest.rainPeak}%), covered by indoor stops.`,
        `Heat peaks at ${unit(hottest.high, "°C")} — outdoor stops sit before 10:00 and after 16:00.`,
      ],
    },
    alerts: [
      {
        tone: "alert",
        title: "Thunderstorm",
        window: `${wettest.label} · ${stormWindow}`,
        detail: `Gusts to ${unit(max(fri.gust), "km/h")} and lightning. Your plan is indoors for this window.`,
      },
    ],
    metrics: [
      { label: "Max Temp", value: unit(hottest.high, "°C"), context: `${hottest.short} 13:00 · outdoor before 10:00, after 16:00`, tone: "caution" },
      { label: "Peak Rain", value: `${wettest.rainPeak}%`, context: `${wettest.short} ${hh(peakRainHour)} · indoor ${stormWindow}`, tone: "caution" },
      { label: "Beach Wind", value: unit(beachWind, "km/h"), context: `${dryDays[0].short} 16:00 · swim-safe below ${unit(RULES.tourism.swimWind, "km/h")}`, tone: "ok" },
      { label: "UV Peak", value: String(uvPeak), context: "SPF 50+ above UV 8", tone: "caution" },
    ],
    sections: [
      { type: "trip", ask: [2, 3], title: "Day-by-Day Plan", days },
      {
        type: "notes",
        ask: [2],
        title: "Weather Adjustments",
        notes: [
          { title: "Marble Mountains moved to 08:30 Fri", body: `Rain chance at 14:00 is ${marbleAt14}%, above the site's 60% limit. At 08:30 it is ${HOURLY.fri.rainProb[8]}%.` },
          { title: `Indoor block ${stormWindow} Fri`, body: "Cham Museum and Han Market cover the full storm window; dinner starts after the rain clears." },
          { title: "Beach at 16:00 Thu", body: `Midday hits ${unit(hottest.high, "°C")}. Rule: outdoor before 10:00 and after 16:00 when heat is 33–37 °C.` },
        ],
      },
      {
        type: "rules",
        ask: [1, 2],
        table: {
          title: "Outdoor Stop Check",
          caption: "Each outdoor stop against its own rain and wind limits from the places database.",
          columns: ["Stop", "Time", "Limit", "Forecast", "Result"],
          rows: outdoorRows,
        },
      },
    ],
    sources: {
      weather: WEATHER_SOURCES,
      agreement: 0.92,
      model: MODEL,
      knowledge: "weather_rules · danang_attractions · danang_restaurants",
      pipeline: [
        PIPELINE_BASE.parse,
        PIPELINE_BASE.resolve,
        { step: "Find Places & Food", agent: "MCP · places, restaurants", ms: 310 },
        PIPELINE_BASE.weather,
        PIPELINE_BASE.consensus,
        PIPELINE_BASE.rules,
        { step: "Order Stops", agent: "cuOpt Route Solver", ms: 120 },
        PIPELINE_BASE.write,
      ],
    },
    map: {
      title: "Trip Route",
      center: [15.98, 108.25],
      zoom: 11,
      markers,
      zones: [],
      route: true,
      legend: [
        { label: "Outdoor stop", tone: "ok", shape: "dot" },
        { label: "Indoor stop", tone: "neutral", shape: "dot" },
      ],
    },
  };

  return {
    session_id: "demo-tourism",
    status: "success",
    response_type: "trip_planning",
    domain: "tourism",
    location: report.location,
    coordinates: { latitude: 16.0544, longitude: 108.2022 },
    report,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. CONSTRUCTION — deck slab pour + tower crane at Hoa Lien Overpass
// ─────────────────────────────────────────────────────────────────────────────

const POUR_HOURS = [7, 8, 9, 10]; // 06:30–10:30
const POUR_WINDOW = "06:30–10:30";
const CRANE_HALT = { from: 12, to: 17 };

function nextKey(key: HourlyKey): HourlyKey {
  return HOURLY_ORDER[Math.min(HOURLY_ORDER.indexOf(key) + 1, HOURLY_ORDER.length - 1)];
}

function evaluatePour(key: HourlyKey) {
  const h = HOURLY[key];
  const temps = POUR_HOURS.map((x) => h.temp[x]);
  const hum = POUR_HOURS.map((x) => h.humidity[x]);
  const wind = POUR_HOURS.map((x) => h.wind[x]);
  const after = span("rainProb", { key, hour: 11 }, { key: nextKey(key), hour: 10 }).map((p) => p.value);
  const rainAfter = max(after);
  const soonRain = slice(key, "rainMm", 11, 15).some((v) => v > 0);
  const firstRain = soonRain ? firstRainAfter(key, 11) : null;
  const gust = max(h.gust);
  const lightning = h.lightning;
  const checks = {
    rainAfter: rainAfter < RULES.concrete.rainAfterPourMax,
    soonRain: !soonRain,
    temp: min(temps) >= RULES.concrete.tempMin && max(temps) <= RULES.concrete.tempMax,
    humidity: min(hum) >= RULES.concrete.humidityMin && max(hum) <= RULES.concrete.humidityMax,
    gust: gust < RULES.crane.gustHalt,
    lightning: lightning.length === 0,
  };
  return {
    temps: range(round(min(temps)), round(max(temps)), "°C"),
    humidity: range(min(hum), max(hum), "%"),
    wind: range(min(wind), max(wind), "km/h"),
    rainAfter,
    firstRain: firstRain ? hh(firstRain.hour) : null,
    gust,
    lightning: lightning.length ? `${hh(lightning[0])}–${hh(lightning[lightning.length - 1] + 1)}` : null,
    checks,
    fails: Object.values(checks).filter((c) => !c).length,
    total: Object.values(checks).length,
  };
}

export function getConstructionMockResponse(): ChatResult {
  const fri = evaluatePour("fri");
  const thu = evaluatePour("thu");
  const friDay = day("fri");
  const thuDay = day("thu");
  const peakGustHour = HOURLY.fri.gust.indexOf(fri.gust);
  const stormRain = sum(HOURLY.fri.rainMm);
  const friRainPeak = max(HOURLY.fri.rainProb);
  const gustAtHalt = HOURLY.fri.gust[CRANE_HALT.from - 1];
  const gustAfter = HOURLY.fri.gust[CRANE_HALT.to];
  const haltWindow = `${hh(CRANE_HALT.from)}–${hh(CRANE_HALT.to)}`;

  // Chart: Thu 06:00 → Fri 20:00, slot 0 = Thu 06:00.
  const friOffset = 24 - 6;
  const bands = [
    { from: 0.5, to: 4.5, label: "Pour Window", tone: "ok" as const },
    { from: friOffset + CRANE_HALT.from, to: friOffset + CRANE_HALT.to, label: "Crane Halt", tone: "alert" as const },
  ];
  const charts: ChartSpec[] = [
    {
      title: "Rain Chance",
      unit: "%",
      kind: "bar",
      points: hourlyPoints("rainProb", { key: "thu", hour: 6 }, { key: "fri", hour: 20 }),
      max: 100,
      threshold: { value: RULES.concrete.rainAfterPourMax, label: "Pour limit 20%" },
      bands,
      tickEvery: 3,
      dividers: [{ at: 0, label: "Thu" }, { at: friOffset, label: "Fri" }],
    },
    {
      title: "Wind Gust",
      unit: "km/h",
      kind: "line",
      points: hourlyPoints("gust", { key: "thu", hour: 6 }, { key: "fri", hour: 20 }),
      max: 70,
      threshold: { value: RULES.crane.gustHalt, label: "Crane halt 60 km/h" },
      bands,
      tickEvery: 3,
      dividers: [{ at: 0, label: "Thu" }, { at: friOffset, label: "Fri" }],
    },
  ];

  const ruleRows: Cell[][] = [
    [cell("Rain chance, 24 h after pour"), cell(`< ${RULES.concrete.rainAfterPourMax}%`), cell(`${fri.rainAfter}% · ${pass(fri.checks.rainAfter)}`, fri.checks.rainAfter), cell(`${thu.rainAfter}% · ${pass(thu.checks.rainAfter)}`, thu.checks.rainAfter)],
    [cell("Rain within 4 h of finishing"), cell("None"), cell(`${fri.firstRain ? `Starts ${fri.firstRain}` : "None"} · ${pass(fri.checks.soonRain)}`, fri.checks.soonRain), cell(`${thu.firstRain ? `Starts ${thu.firstRain}` : "None"} · ${pass(thu.checks.soonRain)}`, thu.checks.soonRain)],
    [cell("Temperature during pour"), cell(`10–35${NB}°C`), cell(`${fri.temps} · ${pass(fri.checks.temp)}`, fri.checks.temp), cell(`${thu.temps} · ${pass(thu.checks.temp)}`, thu.checks.temp)],
    [cell("Humidity during pour"), cell("40–80%"), cell(`${fri.humidity} · ${pass(fri.checks.humidity)}`, fri.checks.humidity), cell(`${thu.humidity} · ${pass(thu.checks.humidity)}`, thu.checks.humidity)],
    [cell("Peak gust (tower crane)"), cell(`< ${unit(RULES.crane.gustHalt, "km/h")}`), cell(`${unit(fri.gust, "km/h")} · ${pass(fri.checks.gust)}`, fri.checks.gust), cell(`${unit(thu.gust, "km/h")} · ${pass(thu.checks.gust)}`, thu.checks.gust)],
    [cell("Lightning within 10 km"), cell("None"), cell(`${fri.lightning ?? "None"} · ${pass(fri.checks.lightning)}`, fri.checks.lightning), cell(`${thu.lightning ?? "None"} · ${pass(thu.checks.lightning)}`, thu.checks.lightning)],
  ];

  const site = { lat: 16.001, lon: 108.152 };

  const report: Report = {
    domain: "construction",
    as_of: AS_OF,
    title: "Deck Slab Pour & Crane Check",
    prompt: SHOWCASE_PROMPTS.construction,
    location: "Hoa Lien Interchange Overpass",
    parsed: [
      { label: "Domain", value: "Construction" },
      { label: "Site", value: "Hoa Lien Interchange Overpass" },
      { label: "Planned", value: `${friDay.label} · morning` },
      { label: "Work", value: "Deck slab pour · Tower crane" },
    ],
    asks: ["Is Friday safe?", "Best pour window", "Crane stop hours"],
    verdict: {
      tone: "alert",
      label: "Reschedule",
      headline: `No. Move the pour to Thursday ${POUR_WINDOW}, and stop the crane Friday ${haltWindow}.`,
      reasons: [
        `Friday fails ${fri.fails} of ${fri.total} pour and crane rules.`,
        `Thunderstorm ${fri.lightning}: ${friRainPeak}% rain, ${unit(stormRain, "mm")}, gusts to ${unit(fri.gust, "km/h")}.`,
        `Thursday passes all ${thu.total}: rain ≤ ${thu.rainAfter}% for 24 h, ${thu.temps}, humidity ${thu.humidity}.`,
      ],
    },
    alerts: [
      {
        tone: "alert",
        title: "Crane Halt",
        window: `${friDay.label} · ${haltWindow}`,
        detail: `Gusts peak at ${unit(fri.gust, "km/h")} at ${hh(peakGustHour)} (halt above ${RULES.crane.gustHalt}). Lightning within 10${NB}km ${fri.lightning}.`,
      },
    ],
    metrics: [
      { label: "Fri Peak Gust", value: unit(fri.gust, "km/h"), context: `${hh(peakGustHour)} · crane halt above ${RULES.crane.gustHalt}`, tone: "alert" },
      { label: "Fri Storm Rain", value: `${friRainPeak}%`, context: `${unit(stormRain, "mm")} · ${fri.lightning}`, tone: "alert" },
      { label: "Thu Rain Risk, 24 h", value: `${thu.rainAfter}%`, context: `After pour · limit ${RULES.concrete.rainAfterPourMax}%`, tone: "ok" },
      { label: "Thu Pour Temp", value: thu.temps, context: `Humidity ${thu.humidity} · limit 40–80%`, tone: "ok" },
    ],
    sections: [
      {
        type: "rules",
        ask: [1],
        table: {
          title: "Rule Check: Friday vs Thursday",
          caption: `Pour ${POUR_WINDOW}. Limits from the construction knowledge base (concrete pouring & crane rules).`,
          columns: ["Rule", "Limit", `Fri (Planned)`, `Thu (Proposed)`],
          rows: ruleRows,
        },
      },
      {
        type: "charts",
        ask: [2, 3],
        title: "Thu 06:00 – Fri 20:00, Hourly",
        caption: "Green: pour window. Dark red: crane halt.",
        charts,
      },
      {
        type: "answers",
        ask: [2, 3],
        title: "Revised Schedule",
        cards: [
          {
            kicker: "Pour Window",
            title: "Best slot this week",
            value: `${thuDay.label} · ${POUR_WINDOW}`,
            tone: "ok",
            points: [
              `Rain ≤ ${thu.rainAfter}% for 24 h after the pour (limit ${RULES.concrete.rainAfterPourMax}%).`,
              "No rain within 4 h of finishing.",
              `${thu.temps}, humidity ${thu.humidity}.`,
              `Wind ${thu.wind} — no curing blankets needed (above ${unit(RULES.concrete.curingBlanketWind, "km/h")}).`,
            ],
          },
          {
            kicker: "Crane Halt",
            title: "Stop hours",
            value: `${friDay.label} · ${haltWindow}`,
            tone: "alert",
            points: [
              `Lower and lock the jib by ${hh(CRANE_HALT.from)}; gusts climb from ${gustAtHalt} to ${unit(fri.gust, "km/h")} by ${hh(peakGustHour)}.`,
              `Lightning within 10${NB}km ${fri.lightning} — clear the deck.`,
              `Restart after ${hh(CRANE_HALT.to)} once gusts stay below ${unit(RULES.crane.sustainedMax, "km/h")} (${gustAfter} at ${hh(CRANE_HALT.to)}) and a visual check is done.`,
              `Thursday: no limits (peak gust ${unit(thu.gust, "km/h")}).`,
            ],
          },
        ],
      },
    ],
    sources: {
      weather: WEATHER_SOURCES,
      agreement: 0.94,
      model: MODEL,
      knowledge: "weather_rules · danang_sites",
      pipeline: [
        PIPELINE_BASE.parse,
        PIPELINE_BASE.resolve,
        { step: "Load Site Profile", agent: "MCP · construction telemetry", ms: 140 },
        PIPELINE_BASE.weather,
        PIPELINE_BASE.consensus,
        PIPELINE_BASE.rules,
        PIPELINE_BASE.write,
      ],
    },
    map: {
      title: "Site & Lightning Radius",
      center: [site.lat, site.lon],
      zoom: 11,
      markers: [
        { id: "site", lat: site.lat, lon: site.lon, label: "S", title: "Hoa Lien Interchange Overpass", detail: `Crane halt Fri ${haltWindow}`, tone: "alert" },
      ],
      zones: [{ lat: site.lat, lon: site.lon, radius_m: RULES.crane.lightningRadiusKm * 1000, label: `Lightning stop radius · 10${NB}km`, tone: "alert" }],
      legend: [
        { label: "Site", tone: "alert", shape: "dot" },
        { label: "Lightning radius, Fri", tone: "alert", shape: "zone" },
      ],
    },
  };

  return {
    session_id: "demo-construction",
    status: "success",
    response_type: "weather_prediction",
    domain: "construction",
    location: report.location,
    coordinates: { latitude: site.lat, longitude: site.lon },
    report,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. AGRICULTURE — irrigation, urea and blast spray for Hoa Vang rice co-op
// ─────────────────────────────────────────────────────────────────────────────

const COOP = { name: "Hoa Vang High-Yield Rice Cooperative", hectares: 145.5, lat: 15.987, lon: 108.124 };
const START_LEVEL_MM = 50;
const SPRAY_HOURS = [8, 9, 10]; // 08:00–11:00

function waterBalance() {
  let level = START_LEVEL_MM;
  let overflow = 0;
  return WEEK.map((d) => {
    const next = level - RULES.rice.dailyUseMm + d.rainHoaVang;
    const capped = Math.min(next, RULES.rice.waterTargetMax * 10);
    overflow += next - capped;
    level = capped;
    return { day: d, levelCm: round(level / 10, 1), overflow: round(overflow, 1) };
  });
}

export function getAgricultureMockResponse(): ChatResult {
  const balance = waterBalance();
  const levels = balance.map((b) => b.levelCm);
  const lowest = balance.reduce((a, b) => (b.levelCm < a.levelCm ? b : a));
  const weekRain = sum(WEEK.map((d) => d.rainHoaVang));
  const fri = day("fri");
  const overflow = balance[balance.length - 1].overflow;
  const effectiveRain = round(weekRain - overflow, 1);
  const rainSupplyM3 = Math.round((effectiveRain * COOP.hectares * 10) / 100) * 100;
  const needsIrrigation = min(levels) < RULES.rice.waterTargetMin;

  // Blast risk: longest run of humidity ≥ 90% starting Fri 13:00.
  const run = span("humidity", { key: "fri", hour: 13 }, { key: "sat", hour: 23 });
  let runLen = 0;
  while (runLen < run.length && run[runLen].value >= RULES.rice.blastHumidity) runLen++;
  const runEnd = run[runLen];
  const runTemps = span("temp", { key: "fri", hour: 13 }, { key: runEnd.key, hour: runEnd.hour - 1 }).map((p) => p.value);
  const blastWindow = `Fri 13:00 – ${day(runEnd.key).short} ${hh(runEnd.hour)}`;

  // Application windows: urea needs no day > 10 mm within 72 h; spray needs calm air and 6 dry hours.
  const keys: HourlyKey[] = ["wed", "thu", "fri", "sat"];
  const windows = keys.map((key) => {
    const idx = WEEK.findIndex((d) => d.key === key);
    const next3 = WEEK.slice(idx, idx + 3);
    const wettest = next3.reduce((a, b) => (b.rainHoaVang > a.rainHoaVang ? b : a));
    const urea = wettest.rainHoaVang <= RULES.rice.ureaMaxDailyRain;
    const wind = SPRAY_HOURS.map((h) => HOURLY[key].wind[h]);
    const rain = firstRainAfter(key, 11);
    const dryHours = rain ? hoursBetween({ key, hour: 11 }, rain) : 48;
    const calm = max(wind) < RULES.rice.sprayWindMax;
    const dry = dryHours >= RULES.rice.sprayDryHours;
    return { key, wettest, urea, wind, dryHours, calm, dry, spray: calm && dry };
  });
  const sprayDay = windows.find((w) => w.spray)!;
  const ureaDay = windows.find((w) => w.urea)!;
  const ureaBackup = (() => {
    const idx = WEEK.findIndex((d) => d.key === ureaDay.key) + 1;
    const next3 = WEEK.slice(idx, idx + 3);
    return next3.every((d) => d.rainHoaVang <= RULES.rice.ureaMaxDailyRain) ? WEEK[idx] : null;
  })();
  const ureaMaxRain = ureaDay.wettest;

  const windowRows: Cell[][] = windows.map((w) => [
    cell(day(w.key).label),
    cell(`${unit(w.wettest.rainHoaVang, "mm")} (${w.wettest.short}) · ${pass(w.urea)}`, w.urea),
    cell(`${range(min(w.wind), max(w.wind), "km/h")} · ${pass(w.calm)}`, w.calm),
    cell(`${w.dryHours >= 48 ? "48+ h" : `${w.dryHours} h`} · ${pass(w.dry)}`, w.dry),
  ]);

  const calendar: CalendarDay[] = balance.map((b) => {
    const items: CalendarDay["items"] = [];
    if (b.day.key === sprayDay.key) items.push({ text: "Blast spray 08:00–11:00", tone: "ok" });
    if (b.day.key === ureaDay.key) items.push({ text: "Urea 06:00–09:00", tone: "ok" });
    if (ureaBackup && b.day.key === ureaBackup.key) items.push({ text: "Urea backup", tone: "neutral" });
    if (b.day.key === "fri") items.push({ text: "Storm · blast risk", tone: "alert" });
    items.push({ text: `Water ${unit(b.levelCm.toFixed(1), "cm")}`, tone: "neutral" });
    return { day: b.day.short, date: b.day.label.split(", ")[1], items };
  });

  const charts: ChartSpec[] = [
    {
      title: "Rain, Hoa Vang",
      unit: "mm",
      kind: "bar",
      points: WEEK.map((d) => ({ tick: d.short, label: d.label, value: d.rainHoaVang })),
      max: 30,
      decimals: 1,
      threshold: { value: RULES.rice.ureaMaxDailyRain, label: "Urea washout above 10 mm" },
    },
    {
      title: "Field Water Level, End of Day",
      unit: "cm",
      kind: "line",
      points: balance.map((b) => ({ tick: b.day.short, label: b.day.label, value: b.levelCm })),
      min: 0,
      max: 6,
      decimals: 1,
      fixedDecimals: true,
      targetRange: { from: RULES.rice.waterTargetMin, to: RULES.rice.waterTargetMax, label: "Target 3–5 cm" },
    },
  ];

  const sprayWind = range(min(sprayDay.wind), max(sprayDay.wind), "km/h");

  const report: Report = {
    domain: "agriculture",
    as_of: AS_OF,
    title: "Rice Field Plan: Hoa Vang Co-op",
    prompt: SHOWCASE_PROMPTS.agriculture,
    location: COOP.name,
    parsed: [
      { label: "Domain", value: "Agriculture" },
      { label: "Farm", value: `Hoa Vang rice co-op · ${unit(COOP.hectares, "ha")}` },
      { label: "Crop", value: "Hè Thu rice · tillering" },
      { label: "When", value: `This week · ${WEEK[0].label.split(", ")[1]}–${WEEK[6].label.split(", ")[1].split(NB)[1]}` },
    ],
    asks: ["Irrigate this week?", "When to top-dress urea", "When to spray for blast"],
    verdict: {
      tone: needsIrrigation ? "caution" : "ok",
      label: needsIrrigation ? "Top Up Needed" : "Skip Irrigation",
      headline: `No irrigation needed. Spray for blast ${day(sprayDay.key).short === "Thu" ? "Thursday" : day(sprayDay.key).short} morning, top-dress urea ${day(ureaDay.key).short === "Sat" ? "Saturday" : day(ureaDay.key).short}.`,
      reasons: [
        `Rain this week: ${unit(weekRain, "mm")} in Hoa Vang, ${unit(fri.rainHoaVang, "mm")} of it on Friday.`,
        `Field water stays within 3–5${NB}cm all week (low ${unit(lowest.levelCm.toFixed(1), "cm")} on ${lowest.day.short}).`,
        `${day(sprayDay.key).short === "Thu" ? "Thursday" : day(sprayDay.key).short} is the only dry, calm spray slot before Friday's storm.`,
      ],
    },
    alerts: [
      {
        tone: "alert",
        title: "Rice Blast Risk",
        window: blastWindow,
        detail: `Humidity ≥ 90% for ${runLen} h at ${range(round(min(runTemps)), round(max(runTemps)), "°C")}. Spray before it starts.`,
      },
      {
        tone: "caution",
        title: "Hold Urea",
        window: "Wed – Fri",
        detail: `Friday's ${unit(fri.rainHoaVang, "mm")} would wash fertilizer into the canals.`,
      },
    ],
    metrics: [
      { label: "Rain This Week", value: unit(weekRain, "mm"), context: `${unit(fri.rainHoaVang, "mm")} on Fri · Hoa Vang`, tone: "neutral" },
      { label: "Field Water Level", value: `${lowest.levelCm.toFixed(1)}–${RULES.rice.waterTargetMax.toFixed(1)}${NB}cm`, context: `Target 3–5${NB}cm · no pumping`, tone: "ok" },
      { label: "Field Water Use", value: `${RULES.rice.dailyUseMm}${NB}mm/day`, context: `ETc ${RULES.rice.etc} + seepage ${RULES.rice.seepage}`, tone: "neutral" },
      { label: "Rain Supply", value: `≈${rainSupplyM3.toLocaleString("en-US")}${NB}m³`, context: `${unit(effectiveRain, "mm")} kept on ${unit(COOP.hectares, "ha")}`, tone: "ok" },
    ],
    sections: [
      {
        type: "charts",
        ask: [1],
        title: "Rain vs Field Water, 7 Days",
        caption: `Start ${unit(START_LEVEL_MM / 10, "cm")}; fields use ${RULES.rice.dailyUseMm}${NB}mm/day; bund outlets drain above 5${NB}cm.`,
        charts,
      },
      {
        type: "answers",
        ask: [1, 2, 3],
        title: "Field Schedule",
        cards: [
          {
            kicker: "Irrigation",
            title: "Pumps",
            value: "None This Week",
            tone: "ok",
            points: [
              `Water stays ${`${lowest.levelCm.toFixed(1)}–${RULES.rice.waterTargetMax.toFixed(1)}${NB}cm`} without pumping (target 3–5${NB}cm).`,
              `Friday's ${unit(fri.rainHoaVang, "mm")} refills the field; outlets drain the ${unit(overflow, "mm")} excess.`,
              `Check again ${lowest.day.label}: level reaches ${unit(lowest.levelCm.toFixed(1), "cm")}.`,
            ],
          },
          {
            kicker: "Blast Spray",
            title: "Tricyclazole, preventive",
            value: `${day(sprayDay.key).label} · 08:00–11:00`,
            tone: "ok",
            points: [
              `Leaves dry after dew; wind ${sprayWind} (limit ${RULES.rice.sprayWindMax}).`,
              `${sprayDay.dryHours} h rain-free after spraying (needs ${RULES.rice.sprayDryHours} h).`,
              `Covers the crop before the ${blastWindow} risk window.`,
            ],
          },
          {
            kicker: "Urea Top-Dress",
            title: "Second split",
            value: `${day(ureaDay.key).label} · 06:00–09:00`,
            tone: "ok",
            points: [
              `No day above ${unit(RULES.rice.ureaMaxDailyRain, "mm")} in the next 72 h (max ${unit(ureaMaxRain.rainHoaVang, "mm")}, ${ureaMaxRain.short}).`,
              `Wed–Fri fail: Friday's ${unit(fri.rainHoaVang, "mm")} would wash it off.`,
              `${ureaBackup ? `Backup: ${ureaBackup.label}. ` : ""}Keep the dose moderate — extra nitrogen raises blast risk.`,
            ],
          },
        ],
      },
      {
        type: "rules",
        ask: [2, 3],
        table: {
          title: "Application Windows",
          caption: "Urea: no day above 10 mm within 72 h. Spray 08:00–11:00: wind below 15 km/h and 6 rain-free hours.",
          columns: ["Day", "Urea · Wettest Day, 72 h", "Spray · Wind", "Spray · Dry Hours"],
          rows: windowRows,
        },
      },
      { type: "calendar", ask: [1, 2, 3], title: "Week at a Glance", days: calendar },
    ],
    sources: {
      weather: WEATHER_SOURCES,
      agreement: 0.93,
      model: MODEL,
      knowledge: "agriculture_rules · FAO-56 crop coefficients",
      pipeline: [
        PIPELINE_BASE.parse,
        PIPELINE_BASE.resolve,
        { step: "Load Field Profile", agent: "MCP · agriculture telemetry", ms: 150 },
        PIPELINE_BASE.weather,
        PIPELINE_BASE.consensus,
        PIPELINE_BASE.rules,
        PIPELINE_BASE.write,
      ],
    },
    map: {
      title: "Co-op Fields",
      center: [COOP.lat, COOP.lon],
      zoom: 13,
      markers: [
        { id: "coop", lat: COOP.lat, lon: COOP.lon, label: "F", title: COOP.name, detail: `${unit(COOP.hectares, "ha")} · surface gravity irrigation`, tone: "ok" },
      ],
      zones: [{ lat: COOP.lat, lon: COOP.lon, radius_m: 680, label: `Co-op fields · ${unit(COOP.hectares, "ha")}`, tone: "ok" }],
      legend: [{ label: `Rice fields · ${unit(COOP.hectares, "ha")}`, tone: "ok", shape: "zone" }],
    },
  };

  return {
    session_id: "demo-agriculture",
    status: "success",
    response_type: "weather_prediction",
    domain: "agriculture",
    location: report.location,
    coordinates: { latitude: COOP.lat, longitude: COOP.lon },
    report,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. SEVERE WEATHER — weekly hazard scan
// ─────────────────────────────────────────────────────────────────────────────

export function getSevereWeatherMockResponse(): ChatResult {
  const fri = day("fri");
  const h = HOURLY.fri;
  const peakGust = max(h.gust);
  const peakGustHour = h.gust.indexOf(peakGust);
  const peakRate = max(h.rainMm);
  const storm = `${hh(h.lightning[0])}–${hh(h.lightning[h.lightning.length - 1] + 1)}`;
  const seaWindHours = hoursWhere((x) => h.wind[x] > RULES.severe.seaWindAvoid, 0, 23);
  const weekRain = sum(WEEK.map((d) => d.rainCity));
  const warnings = WEEK.filter((d) => d.gustMax > RULES.severe.stormGust);
  const mon = day("mon");

  const report: Report = {
    domain: "severe_weather",
    as_of: AS_OF,
    title: "Severe Weather Scan: Da Nang",
    prompt: SHOWCASE_PROMPTS.severe_weather,
    location: "Da Nang",
    parsed: [
      { label: "Domain", value: "Severe Weather" },
      { label: "Where", value: "Da Nang & coast" },
      { label: "When", value: `Next 7 days · ${WEEK[0].label.split(", ")[1]}–${WEEK[6].label.split(", ")[1].split(NB)[1]}` },
      { label: "Wants", value: "Warnings · Typhoons · Plan changes" },
    ],
    asks: ["Any severe weather?", "Any typhoon?", "What to change"],
    verdict: {
      tone: "caution",
      label: `${warnings.length} Warning`,
      headline: `One thunderstorm warning: Friday ${storm}. No typhoon expected in the next 120 h.`,
      reasons: [
        `Friday: ${fri.rainPeak}% storms, gusts to ${unit(peakGust, "km/h")}, lightning ${storm}.`,
        `${mon.short}: showers ${mon.rainPeak}%, gusts ${unit(mon.gustMax, "km/h")} — below warning level.`,
        "No tropical depression forecast in the South China Sea within 120 h.",
      ],
    },
    alerts: [
      {
        tone: "alert",
        title: "Thunderstorm Warning",
        window: `${fri.label} · ${storm}`,
        detail: `Gusts to ${unit(peakGust, "km/h")}, ${unit(sum(h.rainMm), "mm")} rain, lightning within 10${NB}km.`,
      },
    ],
    metrics: [
      { label: "Peak Gust", value: unit(peakGust, "km/h"), context: `Fri ${hh(peakGustHour)} · storm level above ${RULES.severe.stormGust}`, tone: "alert" },
      { label: "Peak Rain Rate", value: unit(peakRate, "mm/h"), context: `Fri 14:00 · heavy above ${RULES.severe.heavyRainRate}`, tone: "caution" },
      { label: "Rain This Week", value: unit(weekRain, "mm"), context: `${unit(fri.rainCity, "mm")} on Fri`, tone: "neutral" },
      { label: "Typhoon Risk", value: "None", context: "Next 120 h", tone: "ok" },
    ],
    sections: [
      {
        type: "charts",
        ask: [1],
        title: "Daily Peaks, 7 Days",
        charts: [
          {
            title: "Peak Gust",
            unit: "km/h",
            kind: "line",
            points: WEEK.map((d) => ({ tick: d.short, label: d.label, value: d.gustMax })),
            max: 70,
            threshold: { value: RULES.severe.stormGust, label: "Storm level 50 km/h" },
          },
          {
            title: "Rain, City",
            unit: "mm",
            kind: "bar",
            points: WEEK.map((d) => ({ tick: d.short, label: d.label, value: d.rainCity })),
            max: 20,
            decimals: 1,
          },
        ],
      },
      {
        type: "answers",
        ask: [3],
        title: "What to Change",
        cards: [
          {
            kicker: "Outdoor Plans",
            title: "Friday afternoon",
            value: `Indoors ${storm}`,
            tone: "alert",
            points: ["Move tours, markets and motorbike trips to the morning.", "Rain clears by 18:00; evenings are fine."],
          },
          {
            kicker: "Beach & Sea",
            title: "Swimming and boats",
            value: `No sea activity Fri ${hh(seaWindHours[0])}–${hh(seaWindHours[seaWindHours.length - 1] + 1)}`,
            tone: "caution",
            points: [
              `Wind tops ${unit(max(h.wind), "km/h")}; avoid the sea above ${unit(RULES.severe.seaWindAvoid, "km/h")}.`,
              `Thu & Sat: wind ≤ ${unit(max([...HOURLY.thu.wind, ...HOURLY.sat.wind]), "km/h")}, swim-safe.`,
            ],
          },
          {
            kicker: "Work Sites",
            title: "Cranes and scaffolding",
            value: "Halt cranes Fri 12:00–17:00",
            tone: "alert",
            points: [`Gusts pass the ${unit(RULES.crane.gustHalt, "km/h")} crane limit at ${hh(peakGustHour)}.`, "Tie down loose materials before noon."],
          },
        ],
      },
      {
        type: "rules",
        ask: [1, 2],
        table: {
          title: "Hazard Check",
          columns: ["Hazard", "Threshold", "Peak This Week", "Status"],
          rows: [
            [cell("Wind gust"), cell(`> ${unit(RULES.severe.stormGust, "km/h")}`), cell(`${unit(peakGust, "km/h")} · Fri ${hh(peakGustHour)}`), cell("Warning", false)],
            [cell("Lightning"), cell(`Within 10${NB}km`), cell(`Fri ${storm}`), cell("Warning", false)],
            [cell("Rain rate"), cell(`> ${unit(RULES.severe.heavyRainRate, "mm/h")}`), cell(`${unit(peakRate, "mm/h")} · Fri 14:00`), cell("Below", true)],
            [cell("Sea wind"), cell(`> ${unit(RULES.severe.seaWindAvoid, "km/h")}`), cell(`${unit(max(h.wind), "km/h")} · Fri 14:00`), cell("Avoid sea", false)],
            [cell("Tropical cyclone"), cell("Within 120 h"), cell("None tracked"), cell("Clear", true)],
          ],
        },
      },
    ],
    sources: {
      weather: WEATHER_SOURCES,
      agreement: 0.95,
      model: MODEL,
      knowledge: "weather_rules · typhoon_construction_protocol",
      pipeline: [
        PIPELINE_BASE.parse,
        PIPELINE_BASE.resolve,
        PIPELINE_BASE.weather,
        PIPELINE_BASE.consensus,
        PIPELINE_BASE.rules,
        PIPELINE_BASE.write,
      ],
    },
    map: {
      title: "Storm Cell, Fri Afternoon",
      center: [16.04, 108.19],
      zoom: 11,
      markers: [
        { id: "beach", lat: 16.0481, lon: 108.2478, label: "B", title: "My Khe Beach", detail: `No swimming Fri ${hh(seaWindHours[0])}–${hh(seaWindHours[seaWindHours.length - 1] + 1)}`, tone: "caution" },
        { id: "port", lat: 16.1286, lon: 108.2215, label: "P", title: "Tien Sa Port", detail: "Small-craft advisory Fri afternoon", tone: "caution" },
      ],
      zones: [{ lat: 16.02, lon: 108.15, radius_m: 12000, label: `Thunderstorm cell · Fri ${storm}`, tone: "alert" }],
      legend: [
        { label: "Advisory point", tone: "caution", shape: "dot" },
        { label: "Storm cell", tone: "alert", shape: "zone" },
      ],
    },
  };

  return {
    session_id: "demo-severe",
    status: "success",
    response_type: "weather_prediction",
    domain: "severe_weather",
    location: report.location,
    coordinates: { latitude: 16.0544, longitude: 108.2022 },
    report,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. ROUTER — showcase prompts first, then keywords
// ─────────────────────────────────────────────────────────────────────────────

const has = (q: string, words: string[]) => words.some((w) => q.includes(w));

export function routeMockQuery(query: string): ChatResult {
  const q = (query || "").toLowerCase().replace(/\s+/g, " ").trim();

  if (q === SHOWCASE_PROMPTS.tourism.toLowerCase()) return getTourismMockResponse();
  if (q === SHOWCASE_PROMPTS.construction.toLowerCase()) return getConstructionMockResponse();
  if (q === SHOWCASE_PROMPTS.agriculture.toLowerCase()) return getAgricultureMockResponse();
  if (q === SHOWCASE_PROMPTS.severe_weather.toLowerCase()) return getSevereWeatherMockResponse();

  if (has(q, ["construct", "concrete", "pour", "slab", "crane", "scaffold", "curing", "overpass", "site", "xây dựng", "bê tông", "cẩu", "công trường", "giàn giáo"])) {
    return getConstructionMockResponse();
  }
  if (has(q, ["agri", "farm", "rice", "paddy", "irrigat", "urea", "fertiliz", "spray", "blast", "crop", "harvest", "hoa vang", "hòa vang", "nông nghiệp", "tưới", "lúa", "ruộng", "bón phân", "đạo ôn"])) {
    return getAgricultureMockResponse();
  }
  if (has(q, ["storm", "severe", "typhoon", "alert", "warning", "disaster", "flood", "bão", "cảnh báo", "lốc", "ngập", "lũ"])) {
    return getSevereWeatherMockResponse();
  }
  return getTourismMockResponse();
}
