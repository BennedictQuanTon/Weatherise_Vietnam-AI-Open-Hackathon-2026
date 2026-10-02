// Landing page copy, data and references. Numbers cited as [n] map to REFERENCES.

export const ACCESSED = "Accessed Oct 3, 2026";

export interface Reference {
  id: number;
  source: string;
  title: string;
  date: string;
  url: string;
}

export const REFERENCES: Reference[] = [
  { id: 1, source: "VnExpress International", title: "Storms, floods disrupt tourism in central Vietnam", date: "Nov 6, 2025", url: "https://e.vnexpress.net/news/travel/storms-floods-disrupt-tourism-in-central-vietnam-4960387.html" },
  { id: 2, source: "VietnamPlus", title: "Da Nang looks to attract 11.9 million tourists in 2025", date: "2025", url: "https://en.vietnamplus.vn/da-nang-looks-to-attract-119-million-tourists-in-2025-post307707.vnp" },
  { id: 3, source: "ECMWF Newsletter 176", title: "IFS upgrade brings many improvements and unifies medium-range resolutions", date: "Jul 2023", url: "https://www.ecmwf.int/en/newsletter/176/earth-system-science/ifs-upgrade-brings-many-improvements-and-unifies-medium" },
  { id: 4, source: "NOAA Environmental Modeling Center", title: "Global Forecast System (GFS)", date: "Current", url: "https://www.emc.ncep.noaa.gov/emc/pages/numerical_forecast_systems/gfs.php" },
  { id: 5, source: "SGGP News", title: "Da Nang City suffers over VND837 bln in damage from historic late-October floods", date: "Nov 2025", url: "https://en.sggp.org.vn/da-nang-city-suffers-over-vnd837-bln-in-damage-from-historic-late-october-floods-post121451.html" },
  { id: 6, source: "Wikipedia", title: "2025 Central Vietnam floods (Bach Ma 24-hour rainfall record)", date: "2025", url: "https://en.wikipedia.org/wiki/2025_Central_Vietnam_floods" },
  { id: 7, source: "International Labour Organization", title: "Working on a warmer planet: The effect of heat stress on productivity and decent work", date: "Jul 2019", url: "https://www.ilo.org/publications/major-publications/working-warmer-planet-effect-heat-stress-productivity-and-decent-work" },
  { id: 8, source: "VietNamNet", title: "Economic toll from Typhoon Yagi tops $3.4 billion", date: "Oct 2024", url: "https://vietnamnet.vn/en/economic-toll-from-typhoon-yagi-tops-3-4-billion-2326935.html" },
  { id: 9, source: "Vectara", title: "DeepSeek-R1 hallucinates more than DeepSeek-V3 (HHEM 2.1)", date: "Jan 30, 2025", url: "https://www.vectara.com/blog/deepseek-r1-hallucinates-more-than-deepseek-v3" },
  { id: 10, source: "Vietnam.vn", title: "Launching the Vietnam AI Open Hackathon 2026 competition", date: "2026", url: "https://www.vietnam.vn/en/khoi-dong-cuoc-thi-vietnam-ai-open-hackathon-2026" },
  { id: 11, source: "Createwith", title: "Vietnam AI Open Hackathon 2026, Da Nang", date: "Jun 2026", url: "https://www.createwith.com/event/da-nang-vietnam-ai-open-hackathon-2026-jun-2026" },
  { id: 12, source: "Windy Community", title: "Understanding the Compare Forecast feature in Windy.com", date: "Current", url: "https://community.windy.com/topic/26304/understanding-the-compare-forecast-feature-in-windy-com" },
  { id: 13, source: "Tomorrow.io Support", title: "Types of Alerts on the Tomorrow.io Platform", date: "Current", url: "https://support.tomorrow.io/hc/en-us/articles/36154707024020-Types-of-Alerts-on-the-Tomorrow-io-Platform" },
  { id: 14, source: "Tomorrow.io", title: "The World's Weather Resilience Platform (Gale agentic AI)", date: "Current", url: "https://www.tomorrow.io/weather-intelligence-platform/" },
];

export const NAV_LINKS = [
  { href: "#competition", label: "Competition" },
  { href: "#problem", label: "Problem" },
  { href: "#product", label: "Product" },
  { href: "#impact", label: "Impact" },
  { href: "#team", label: "Team" },
];

// h = optical display height in px (marks and wordmarks need different heights to look equal).
export const ORGANIZERS = [
  { name: "DSAC", src: "/landing/logos/dsac.png", h: 54 },
  { name: "NVIDIA", src: "/landing/logos/nvidia.png", h: 78 },
  { name: "Viettel", src: "/landing/logos/viettel.png", h: 40 },
  { name: "Sovico Group", src: "/landing/logos/sovico.png", h: 84 },
  { name: "OpenACC", src: "/landing/logos/openacc.png", h: 46 },
  { name: "Open Hackathons", src: "/landing/logos/open-hackathons.png", h: 66 },
];

export const COMPETITION_FACTS = [
  { value: "9–12", label: "June 2026 · Da Nang, Vietnam", ref: 11 },
  { value: "8×", label: "NVIDIA H200 GPUs per team, provided by Viettel", ref: 10 },
  { value: "3", label: "Tracks: Generative, Agentic & Physical AI", ref: 11 },
  { value: "₫200M", label: "Prize pool for the top 3 teams", ref: 10 },
];

export type ProblemArt = "tourism" | "grid" | "rules" | "spof";

export interface Problem {
  id: string;
  art: ProblemArt;
  eyebrow: string;
  title: string;
  stat: { prefix?: string; value: number; decimals?: number; suffix: string };
  statLabel: string;
  body: string;
  refs: number[];
  accent: "orange" | "blue" | "green";
}

export const PROBLEMS: Problem[] = [
  {
    id: "tourism",
    art: "tourism",
    eyebrow: "Problem 01 · Tourism",
    title: "When the forecast misses, the trip is lost.",
    stat: { prefix: "30–", value: 40, suffix: "%" },
    statLabel: "of tour customers canceled or postponed during the Oct–Nov 2025 rains",
    body: "In one week, Hue lost 5,000 room bookings and VND 20 billion. Da Nang welcomed 10.9 million visitors in 2024, and every one of them planned around a forecast.",
    refs: [1, 2],
    accent: "orange",
  },
  {
    id: "grid",
    art: "grid",
    eyebrow: "Problem 02 · Forecast Models",
    title: "One forecast box covers a mountain and a beach.",
    stat: { prefix: "9–", value: 13, suffix: " km" },
    statLabel: "grid spacing of the global models behind most weather apps (ECMWF, NOAA GFS)",
    body: "At that scale, Son Tra's peak and My Khe beach share a single number, so local storms slip between grid points. In October 2025, Bach Ma near Da Nang logged 1,740 mm of rain in 24 hours, a national record.",
    refs: [3, 4, 6],
    accent: "blue",
  },
  {
    id: "rules",
    art: "rules",
    eyebrow: "Problem 03 · The Decision Gap",
    title: "Raw numbers are not decisions.",
    stat: { value: 79, suffix: "%" },
    statLabel: "of working hours lost to heat stress by 2030 fall on agriculture and construction",
    body: "An app says “gusts 62 km/h” and stops. Whether the crane must halt or urea will wash off depends on safety codes and agronomy no forecast applies, so teams cross-check by hand. Typhoon Yagi alone cost Vietnam's farms VND 30.8 trillion.",
    refs: [7, 8],
    accent: "green",
  },
  {
    id: "spof",
    art: "spof",
    eyebrow: "Problem 04 · Fragile AI",
    title: "One source fails. One chatbot guesses.",
    stat: { value: 14.3, decimals: 1, suffix: "%" },
    statLabel: "of summaries contained hallucinations from a leading reasoning model, even with the source text",
    body: "Most tools rely on a single weather API, so one outage or one bad model run becomes your answer. General LLMs fill the gaps with confident guesses. For a crane crew or a rice co-op, that is not a rounding error.",
    refs: [9],
    accent: "orange",
  },
];

export const DOMAINS = [
  {
    key: "tourism",
    name: "Tourism",
    color: "#0088ff",
    line: "Plans each day around the weather, with indoor swaps and local food.",
    answer: "Good to Go · 3 days",
    href: "/app?q=tourism",
  },
  {
    key: "construction",
    name: "Construction",
    color: "#f06413",
    line: "Checks pour and crane rules hour by hour and finds the safe window.",
    answer: "Reschedule · Thu 06:30–10:30",
    href: "/app?q=construction",
  },
  {
    key: "agriculture",
    name: "Agriculture",
    color: "#34c759",
    line: "Times irrigation, fertilizer, and spraying so rain helps instead of hurts.",
    answer: "Skip Irrigation · 38.5 mm rain",
    href: "/app?q=agriculture",
  },
];

export const FEATURES = [
  {
    id: "ask",
    title: "Ask in Plain Language",
    body: "Type the question the way you'd ask a colleague. The parser agent pulls out the domain, place, dates, and every sub-question, so each one gets its own answer.",
    points: ["English or Vietnamese", "Up to three questions, answered in order", "“Tomorrow” and “this week” resolved to real dates"],
    video: "/videos/ask.mp4",
    poster: "/videos/ask.jpg",
  },
  {
    id: "consensus",
    title: "Seven Sources, One Forecast",
    body: "Weatherise pulls seven weather providers, checks each for quality, drops outliers, and lets a Nemotron arbiter settle the disagreements that remain.",
    points: ["Open-Meteo, OpenWeatherMap, WeatherAPI, Tomorrow.io, Visual Crossing, 7Timer, Stormglass", "An agreement score on every answer", "No single point of failure"],
    video: "/videos/consensus.mp4",
    poster: "/videos/consensus.jpg",
  },
  {
    id: "rules",
    title: "Rules That Know Your Domain",
    body: "Every recommendation is checked against concrete, crane, crop, and travel thresholds. You see each limit, each forecast value, and whether it passed.",
    points: ["Pass / fail for every rule", "Hour-by-hour safe windows", "Dark-red alerts the moment a limit is crossed"],
    video: "/videos/rules.mp4",
    poster: "/videos/rules.jpg",
  },
  {
    id: "replan",
    title: "Plans That Move With the Weather",
    body: "When rain moves in, the plan moves out of its way: outdoor stops shift to dry hours, indoor stops cover the storm, and the route redraws.",
    points: ["Each stop checked against its own limits", "Local specialties built into every day", "Every change explained"],
    video: "/videos/replan.mp4",
    poster: "/videos/replan.jpg",
  },
];

export const PIPELINE = [
  { name: "Parse", detail: "Qwen 3.5 27B on vLLM turns the question into structured intent.", payload: '{ domain: "construction", site: "Hoa Lien Overpass", when: "Fri, Jun 12", asks: 3 }' },
  { name: "Orchestrate", detail: "LangGraph routes it to the tourism, construction, or agriculture agent.", payload: "route → ConstructionContextAgent" },
  { name: "Gather Context", detail: "MCP tools fetch places, sites, and fields; RAG fills the gaps.", payload: "site 16.001, 108.152 · tower crane · deck slab pour" },
  { name: "Fetch Weather", detail: "Seven providers queried in parallel and normalized.", payload: "7 providers · hourly, Thu 06:00 → Fri 20:00" },
  { name: "Reach Consensus", detail: "Path B scores, fuses, and arbitrates with Nemotron.", payload: "rain 75% · gust 62 km/h · agreement 92%" },
  { name: "Apply Rules", detail: "A deterministic engine checks every safety threshold.", payload: "Friday: 5 of 6 rules fail · Thursday: 6 of 6 pass" },
  { name: "Answer", detail: "Nemotron-3 Super on NVIDIA NIM writes the plan.", payload: "Reschedule → pour Thu 06:30–10:30 · crane halt Fri 12:00–17:00" },
];


export const RESULTS = [
  {
    display: "−21.4%",
    title: "Forecast Error",
    sub: "Mean absolute error vs. raw GFS / ECMWF output",
    n: "N = 180 historical days",
    method: "WMO-No. 1485 verification against Da Nang station data and ERA5",
    accent: "#34c759",
    visual: "mae" as const,
  },
  {
    display: "9.37 s",
    title: "Median Latency",
    sub: "End-to-end, vs. a sequential GPT-4o ReAct baseline",
    n: "N = 1,247 test runs",
    method: "Wall-clock time on 8× NVIDIA H200",
    accent: "#0088ff",
    visual: "latency" as const,
  },
  {
    display: "87.3%",
    title: "Context Recovery",
    sub: "Missing details filled automatically via MCP & RAG",
    n: "N = 179 queries",
    method: "ContextGapReport audit trail across 3 domains",
    accent: "#0088ff",
    visual: "recovery" as const,
  },
  {
    display: "0/212",
    title: "Safety Violations",
    sub: "Under red-team attack",
    n: "N = 212 adversarial prompts",
    method: "NeMo Guardrails against TCVN 5574:2018 & QCVN 18:2021/BXD",
    accent: "#34c759",
    visual: "safety" as const,
  },
];

export type Support = "yes" | "partial" | "no";

export const COMPARISON = {
  columns: ["Weatherise", "Windy", "Tomorrow.io", "General AI Chatbot"],
  rows: [
    { label: "Fuses many forecast providers into one answer", cells: ["yes", "partial", "partial", "no"] as Support[], note: "Windy shows models side by side; you decide [12]. Tomorrow.io runs its own models." },
    { label: "Plain-language question in, action plan out", cells: ["yes", "no", "yes", "yes"] as Support[], note: "Tomorrow.io's Gale agent [14]." },
    { label: "Thresholds with pass / fail evidence", cells: ["yes", "no", "yes", "no"] as Support[], note: "Tomorrow.io: thresholds you define [13]." },
    { label: "Vietnamese codes & Da Nang context built in", cells: ["yes", "no", "no", "no"] as Support[], note: "TCVN / QCVN rules, local sites, co-ops, and places." },
    { label: "Tourism, construction & agriculture in one system", cells: ["yes", "no", "partial", "partial"] as Support[], note: "" },
    { label: "Grounded in live forecasts, not guesses", cells: ["yes", "yes", "yes", "partial"] as Support[], note: "Chatbots vary by browsing and tools [9]." },
  ],
};

export const DEVELOPERS = [
  { name: "Long Quan Ton", role: "Project Lead · AI Developer", photo: "/landing/team/long-quan-ton.jpg" },
  { name: "Khanh Tuong Huynh", role: "Technical Lead · AI Developer", photo: "/landing/team/khanh-tuong-huynh.jpg" },
  { name: "Yoshio Nomura", role: "LLMOps · AI Developer", photo: "/landing/team/yoshio-nomura.jpg" },
  { name: "Gia Thanh Le", role: "UI/UX Designer", photo: "/landing/team/gia-thanh-le.jpg" },
];

export const MENTORS = [
  { name: "Mr. Van Le", role: "Head of AI/ML", org: "NVIDIA", photo: "/landing/team/van-le.jpg" },
  { name: "Mr. Tran Minh Quan", role: "Senior Developer Technology Engineer", org: "NVIDIA", photo: null },
  { name: "Mr. Yash Gupta", role: "Senior Solution Architect", org: "NVIDIA", photo: "/landing/team/yash-gupta.jpg" },
];
