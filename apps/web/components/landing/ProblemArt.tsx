"use client";

// Four animated illustrations for the Problem story. Each animates when `active`.
// Transforms/opacity only; the CSS reduced-motion rules stop the loops.

import type { ProblemArt as ArtKey } from "./content";

const T = "cubic-bezier(0.22, 1, 0.36, 1)";
const show = (active: boolean, delay = 0, from = "translateY(14px)") => ({
  opacity: active ? 1 : 0,
  transform: active ? "none" : from,
  transition: `opacity 700ms ${T} ${delay}ms, transform 900ms ${T} ${delay}ms`,
});

const INK = "#101010";
const SMOKE = "#6e6e73";
const SILVER = "#d0d0d3";
const BLUE = "#0088ff";
const GREEN = "#34c759";
const ORANGE = "#f06413";

function Rain({ x, y, w, active }: { x: number; y: number; w: number; active: boolean }) {
  const lines = Array.from({ length: 14 }, (_, i) => i);
  return (
    <g className="l-rain" style={{ opacity: active ? 1 : 0, transition: "opacity 600ms" }}>
      {lines.map((i) => (
        <line
          key={i}
          x1={x + (i * w) / 14}
          y1={y}
          x2={x + (i * w) / 14 - 6}
          y2={y + 16}
          stroke={BLUE}
          strokeWidth="2"
          strokeLinecap="round"
          opacity="0.55"
          style={{ animationDelay: `${(i * 137) % 1000}ms` }}
        />
      ))}
    </g>
  );
}

function Cloud({ x, y, s = 1, fill = "#e6eef8" }: { x: number; y: number; s?: number; fill?: string }) {
  return (
    <path
      transform={`translate(${x} ${y}) scale(${s})`}
      d="M20 52c-11 0-20-8-20-18 0-9 7-17 16-18C19 6 29 0 40 0c12 0 22 8 25 19 1 0 2 0 3 0 11 0 20 8 20 17 0 9-9 16-20 16z"
      fill={fill}
    />
  );
}

function TourismArt({ active }: { active: boolean }) {
  const days = [
    { d: "Day 1", place: "Son Tra Peninsula", time: "08:00" },
    { d: "Day 2", place: "Marble Mountains", time: "14:00" },
    { d: "Day 3", place: "Hoi An Old Town", time: "09:00" },
  ];
  return (
    <svg viewBox="0 0 480 420" className="h-full w-full" role="img" aria-label="Three trip days under a rain cloud, two of them stamped Cancelled.">
      <g style={show(active, 0, "translateY(-10px)")}>
        <Cloud x={150} y={18} s={1.9} fill="#dfe8f3" />
        <Cloud x={250} y={40} s={1.3} fill="#e9eff7" />
      </g>
      <Rain x={150} y={120} w={200} active={active} />
      {days.map((day, i) => (
        <g key={day.d} style={show(active, 200 + i * 140)}>
          <rect x={60 + i * 18} y={170 + i * 62} width={330} height={74} rx={18} fill="#fff" style={{ filter: "drop-shadow(0 6px 18px rgba(16,16,16,0.10))" }} />
          <text x={84 + i * 18} y={200 + i * 62} fontSize="13" fontWeight="600" fill={SMOKE}>
            {day.d} · {day.time}
          </text>
          <text x={84 + i * 18} y={224 + i * 62} fontSize="18" fontWeight="600" fill={INK}>
            {day.place}
          </text>
          {i < 2 && (
            <g style={{ ...show(active, 900 + i * 260, "scale(1.6)"), transformOrigin: `${330 + i * 18}px ${208 + i * 62}px` }}>
              <rect x={276 + i * 18} y={192 + i * 62} width={104} height={30} rx={15} fill="none" stroke={ORANGE} strokeWidth="2.5" transform={`rotate(-8 ${328 + i * 18} ${207 + i * 62})`} />
              <text x={328 + i * 18} y={212 + i * 62} fontSize="13" fontWeight="700" fill={ORANGE} textAnchor="middle" transform={`rotate(-8 ${328 + i * 18} ${207 + i * 62})`} letterSpacing="1">
                CANCELLED
              </text>
            </g>
          )}
        </g>
      ))}
    </svg>
  );
}

function GridArt({ active }: { active: boolean }) {
  return (
    <svg viewBox="0 0 480 420" className="h-full w-full" role="img" aria-label="A single forecast grid box covering Son Tra mountain and My Khe beach in Da Nang.">
      <defs>
        <pattern id="grid-fine" width="24" height="24" patternUnits="userSpaceOnUse">
          <path d="M24 0H0V24" fill="none" stroke="#e3e6ea" strokeWidth="1" />
        </pattern>
      </defs>
      {/* sea and land */}
      <rect x="20" y="20" width="440" height="380" rx="28" fill="#eaf4ff" />
      <path d="M20 48a28 28 0 0 1 28-28h170c-10 60 6 110 40 150 40 46 50 110 20 170-14 30-12 40-6 60H48a28 28 0 0 1-28-28z" fill="#f4f6f1" />
      <path d="M232 72c40-30 120-36 170-14 18 8 16 30-6 34-40 8-72 2-108 22-20 11-44 6-56-42z" fill="#eef3ea" />
      <rect x="20" y="20" width="440" height="380" rx="28" fill="url(#grid-fine)" opacity="0.6" />
      {/* Son Tra peak */}
      <g style={show(active, 150)}>
        <path d="M290 92l28-44 30 44z" fill="#cfd8c6" />
        <path d="M309 63l9-15 10 15-6-2-4 5-4-4z" fill="#fff" />
      </g>
      {/* My Khe beach line */}
      <path d="M262 170c34 46 44 108 16 168" fill="none" stroke="#f3d9a4" strokeWidth="10" strokeLinecap="round" style={show(active, 250)} />
      {/* The coarse grid box */}
      <rect
        x="200"
        y="40"
        width="220"
        height="250"
        rx="6"
        fill="rgba(0,136,255,0.06)"
        stroke={BLUE}
        strokeWidth="3"
        strokeDasharray="940"
        strokeDashoffset={active ? 0 : 940}
        style={{ transition: `stroke-dashoffset 1600ms ${T} 300ms` }}
      />
      <g style={show(active, 1300)}>
        <rect x="236" y="296" width="184" height="58" rx="14" fill="#fff" style={{ filter: "drop-shadow(0 6px 18px rgba(16,16,16,0.12))" }} />
        <text x="252" y="320" fontSize="12" fontWeight="600" fill={SMOKE}>
          1 grid cell · 9–13 km
        </text>
        <text x="252" y="342" fontSize="16" fontWeight="700" fill={INK}>
          One value: 40% rain
        </text>
      </g>
      {/* What actually happens */}
      <g style={show(active, 1000, "scale(0.6)")}>
        <circle cx="319" cy="106" r="16" fill="#fff" stroke={ORANGE} strokeWidth="2.5" />
        <path d="M313 104l4-8 2 6 5-1-6 10 1-6z" fill={ORANGE} />
        <text x="342" y="111" fontSize="13" fontWeight="600" fill={INK}>
          Son Tra: storm
        </text>
      </g>
      <g style={show(active, 1150, "scale(0.6)")}>
        <circle cx="290" cy="232" r="16" fill="#fff" stroke={GREEN} strokeWidth="2.5" />
        <circle cx="290" cy="232" r="6" fill={GREEN} />
        <text x="312" y="237" fontSize="13" fontWeight="600" fill={INK}>
          My Khe: sun
        </text>
      </g>
      <text x="60" y="380" fontSize="12" fill={SMOKE} style={show(active, 400)}>
        Da Nang · illustrative
      </text>
    </svg>
  );
}

function RulesArt({ active }: { active: boolean }) {
  const json = [
    ["gust_kmh", "62"],
    ["rain_pct", "75"],
    ["temp_c", "31"],
    ["humidity", "84"],
  ];
  const questions = ["Run the crane?", "Pour concrete?", "Spray today?"];
  return (
    <svg viewBox="0 0 480 420" className="h-full w-full" role="img" aria-label="A weather API returns raw numbers; the decisions they should answer remain question marks.">
      <g style={show(active, 0, "translateX(-16px)")}>
        <rect x="24" y="80" width="190" height="230" rx="20" fill={INK} />
        <text x="44" y="112" fontSize="12" fontWeight="600" fill="#8e8e93">
          weather_api.json
        </text>
        {json.map(([k, v], i) => (
          <text key={k} x="44" y={150 + i * 36} fontSize="15" fontFamily="ui-monospace, SFMono-Regular, monospace" fill="#e5e5ea">
            <tspan fill="#8ab4f8">{k}</tspan>
            <tspan fill="#e5e5ea">: </tspan>
            <tspan fill="#feab30">{v}</tspan>
          </text>
        ))}
      </g>
      <g style={show(active, 350)}>
        <path d="M226 195h40" stroke={SILVER} strokeWidth="3" strokeLinecap="round" strokeDasharray="4 8" />
        <path d="M262 186l10 9-10 9" fill="none" stroke={SILVER} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      </g>
      {questions.map((q, i) => (
        <g key={q} style={show(active, 500 + i * 180, "translateX(16px)")}>
          <rect x="282" y={92 + i * 74} width="176" height="58" rx="16" fill="#fff" style={{ filter: "drop-shadow(0 6px 18px rgba(16,16,16,0.10))" }} />
          <text x="298" y={126 + i * 74} fontSize="14" fontWeight="600" fill={INK}>
            {q}
          </text>
          <g className="l-pulse" style={{ animationDelay: `${i * 300}ms` }}>
            <circle cx="438" cy={121 + i * 74} r="11" fill="#fff3e8" />
            <text x="438" y={126 + i * 74} fontSize="14" fontWeight="700" fill={ORANGE} textAnchor="middle">
              ?
            </text>
          </g>
        </g>
      ))}
      <g style={show(active, 1200)}>
        <text x="282" y="350" fontSize="13" fill={SMOKE}>
          Checked by hand, app by app.
        </text>
      </g>
    </svg>
  );
}

function SpofArt({ active }: { active: boolean }) {
  return (
    <svg viewBox="0 0 480 420" className="h-full w-full" role="img" aria-label="A single weather API connection breaks, and a chatbot confidently gives unsafe advice.">
      <g style={show(active, 0)}>
        <rect x="40" y="70" width="150" height="70" rx="18" fill="#fff" style={{ filter: "drop-shadow(0 6px 18px rgba(16,16,16,0.10))" }} />
        <text x="62" y="100" fontSize="12" fontWeight="600" fill={SMOKE}>
          Only source
        </text>
        <text x="62" y="122" fontSize="17" fontWeight="700" fill={INK}>
          Weather API
        </text>
      </g>
      <g style={show(active, 250)}>
        <path d="M190 105c60 0 70 60 120 60" fill="none" stroke={SILVER} strokeWidth="3" strokeDasharray="6 8" />
        <g className="l-pulse">
          <circle cx="250" cy="130" r="15" fill="#fff3e8" />
          <path d="M244 124l12 12M256 124l-12 12" stroke={ORANGE} strokeWidth="3" strokeLinecap="round" />
        </g>
      </g>
      <g style={show(active, 450)}>
        <rect x="290" y="140" width="150" height="56" rx="18" fill={INK} />
        <text x="312" y="174" fontSize="16" fontWeight="600" fill="#fff">
          Your decision
        </text>
      </g>
      {/* Chatbot guess */}
      <g style={show(active, 800, "translateY(20px)")}>
        <path d="M60 236h300a20 20 0 0 1 20 20v52a20 20 0 0 1-20 20H110l-26 20v-20H60a20 20 0 0 1-20-20v-52a20 20 0 0 1 20-20z" fill="#fff" style={{ filter: "drop-shadow(0 8px 22px rgba(16,16,16,0.12))" }} />
        <text x="66" y="268" fontSize="12" fontWeight="600" fill={SMOKE}>
          General AI chatbot
        </text>
        <text x="66" y="298" fontSize="17" fontWeight="600" fill={INK}>
          “Friday looks fine. Pour away!”
        </text>
      </g>
      <g style={show(active, 1150, "scale(0.7)")}>
        <rect x="276" y="352" width="168" height="44" rx="22" fill="#fff3e8" />
        <text x="360" y="379" fontSize="14" fontWeight="700" fill={ORANGE} textAnchor="middle">
          Actual: 75% storm risk
        </text>
      </g>
    </svg>
  );
}

export default function ProblemArtView({ art, active }: { art: ArtKey; active: boolean }) {
  if (art === "tourism") return <TourismArt active={active} />;
  if (art === "grid") return <GridArt active={active} />;
  if (art === "rules") return <RulesArt active={active} />;
  return <SpofArt active={active} />;
}
