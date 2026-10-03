// Report view contract — the shape the result screen renders.
// Mock data and (later) the backend composer both produce this.

export type Tone = "ok" | "caution" | "alert" | "neutral";
export type ReportDomain = "tourism" | "construction" | "agriculture" | "severe_weather";

export interface ParsedField {
  label: string;
  value: string;
}

export interface Verdict {
  tone: Tone;
  label: string;
  headline: string;
  reasons: string[];
}

export interface AlertItem {
  tone: "alert" | "caution";
  title: string;
  window: string;
  detail: string;
}

export interface Metric {
  label: string;
  value: string;
  context: string;
  tone: Tone;
}

export interface ChartPoint {
  tick: string; // short axis label, e.g. "06"
  label: string; // full tooltip label, e.g. "Thu 06:00"
  value: number;
}

export interface ChartBand {
  from: number; // slot offset; slot i spans [i, i + 1]
  to: number;
  label: string;
  tone: Tone;
}

export interface ChartSpec {
  title: string;
  unit: string;
  kind: "bar" | "line";
  points: ChartPoint[];
  min?: number;
  max?: number;
  decimals?: number;
  fixedDecimals?: boolean; // always show `decimals` places, e.g. 5.0 cm
  threshold?: { value: number; label: string };
  targetRange?: { from: number; to: number; label: string };
  bands?: ChartBand[];
  tickEvery?: number;
  dividers?: { at: number; label: string }[];
}

export interface AnswerCard {
  kicker: string;
  title: string;
  value: string;
  tone: Tone;
  points: string[];
}

export interface Cell {
  text: string;
  tone?: Tone;
}

export interface RuleTable {
  title: string;
  caption?: string;
  columns: string[];
  rows: Cell[][];
}

export interface Note {
  title: string;
  body: string;
}

export interface CalendarDay {
  day: string;
  date: string;
  items: { text: string; tone: Tone }[];
}

export interface TripStop {
  time: string;
  name: string;
  area: string;
  kind: "food" | "sight" | "beach" | "market" | "museum" | "river";
  indoor: boolean;
  note: string;
  specialty?: string;
  forecast: string;
  tone: Tone;
  moved?: string;
  lat: number;
  lon: number;
}

export interface TripDay {
  day: number;
  date: string;
  title: string;
  summary: string;
  condition: string;
  high: number;
  low: number;
  peakRain: number;
  uv: number;
  charts: ChartSpec[];
  stops: TripStop[];
}

export type ReportSection =
  | { type: "charts"; ask?: number[]; title: string; caption?: string; charts: ChartSpec[] }
  | { type: "answers"; ask?: number[]; title: string; cards: AnswerCard[] }
  | { type: "trip"; ask?: number[]; title: string; days: TripDay[] }
  | { type: "rules"; ask?: number[]; table: RuleTable }
  | { type: "notes"; ask?: number[]; title: string; notes: Note[] }
  | { type: "calendar"; ask?: number[]; title: string; caption?: string; days: CalendarDay[] };

export interface PipelineStep {
  step: string;
  agent: string;
  ms: number;
}

export interface ReportSources {
  weather: string[];
  agreement: number;
  model: string;
  knowledge: string;
  pipeline: PipelineStep[];
}

export interface ReportMarker {
  id: string;
  lat: number;
  lon: number;
  label: string;
  title: string;
  detail?: string;
  tone: Tone;
  day?: number;
}

export interface ReportZone {
  lat: number;
  lon: number;
  radius_m: number;
  label: string;
  tone: Tone;
}

export interface ReportMapData {
  title: string;
  center: [number, number];
  zoom: number;
  markers: ReportMarker[];
  zones: ReportZone[];
  route?: boolean;
  legend: { label: string; tone: Tone; shape: "dot" | "zone" }[];
}

export interface Report {
  domain: ReportDomain;
  as_of: string;
  title: string;
  prompt: string;
  location: string;
  parsed: ParsedField[];
  asks: string[];
  verdict: Verdict;
  alerts: AlertItem[];
  metrics: Metric[];
  sections: ReportSection[];
  sources: ReportSources;
  map: ReportMapData;
}
