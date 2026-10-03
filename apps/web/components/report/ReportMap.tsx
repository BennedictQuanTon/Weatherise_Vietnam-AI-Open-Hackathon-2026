"use client";

import { useEffect, useMemo } from "react";
import { Circle, MapContainer, Marker, Polyline, TileLayer, Tooltip, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { ReportMapData, Tone } from "@/lib/report/types";

// Leaflet writes colors into SVG attributes, so CSS variables can't be used here.
const TONE_HEX: Record<"light" | "dark", Record<Tone, string>> = {
  light: { ok: "#17703f", caution: "#9a5b00", alert: "#8a1c2b", neutral: "#171717" },
  dark: { ok: "#4ade80", caution: "#f5b445", alert: "#f0a5ae", neutral: "#ededed" },
};

const TILES = {
  light: "https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}",
  dark: "https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}",
};

function pin(label: string, color: string, ink: string) {
  return L.divIcon({
    className: "",
    iconSize: [26, 26],
    iconAnchor: [13, 13],
    html: `<div style="width:26px;height:26px;border-radius:9999px;background:${color};color:${ink};display:flex;align-items:center;justify-content:center;font:600 12px Geist,system-ui,sans-serif;box-shadow:0 0 0 2px ${ink},0 1px 4px rgba(0,0,0,.35)">${label}</div>`,
  });
}

function FitView({ points, zones, center, zoom }: { points: [number, number][]; zones: ReportMapData["zones"]; center: [number, number]; zoom: number }) {
  const map = useMap();
  const key = points.map((p) => p.join(",")).join("|") + zones.map((z) => z.radius_m).join(",");
  useEffect(() => {
    const bounds = L.latLngBounds(points);
    zones.forEach((z) => bounds.extend(L.latLng(z.lat, z.lon).toBounds(z.radius_m * 2)));
    // Extra bottom padding keeps pins clear of the legend.
    if (bounds.isValid() && (points.length > 1 || zones.length)) {
      map.fitBounds(bounds, { paddingTopLeft: [32, 32], paddingBottomRight: [32, 84], maxZoom: 15 });
    } else map.setView(points[0] ?? center, zoom);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, map]);
  return null;
}

export default function ReportMap({
  map,
  activeDay,
  theme,
}: {
  map: ReportMapData;
  activeDay?: number;
  theme: "light" | "dark";
}) {
  const hex = TONE_HEX[theme];
  const ink = theme === "dark" ? "#0a0a0a" : "#ffffff";
  const hasDays = map.markers.some((m) => m.day !== undefined);
  const markers = useMemo(
    () => (hasDays ? map.markers.filter((m) => m.day === (activeDay ?? 1)) : map.markers),
    [map.markers, hasDays, activeDay],
  );
  const points = markers.map((m) => [m.lat, m.lon] as [number, number]);

  return (
    <div className="relative h-full min-h-[280px] w-full">
      <MapContainer center={map.center} zoom={map.zoom} scrollWheelZoom={false} className="h-full w-full" zoomControl>
        <TileLayer
          key={theme}
          url={TILES[theme]}
          maxNativeZoom={16}
          attribution='&copy; <a href="https://www.esri.com">Esri</a> &middot; &copy; OpenStreetMap'
        />
        <FitView points={points} zones={map.zones} center={map.center} zoom={map.zoom} />
        {map.zones.map((z) => (
          <Circle
            key={z.label}
            center={[z.lat, z.lon]}
            radius={z.radius_m}
            pathOptions={{ color: hex[z.tone], weight: 1.5, fillColor: hex[z.tone], fillOpacity: 0.1 }}
          >
            <Tooltip sticky>{z.label}</Tooltip>
          </Circle>
        ))}
        {map.route && points.length > 1 && (
          <Polyline positions={points} pathOptions={{ color: hex.neutral, weight: 2, opacity: 0.55, dashArray: "4 6" }} />
        )}
        {markers.map((m) => (
          <Marker key={m.id} position={[m.lat, m.lon]} icon={pin(m.label, hex[m.tone], ink)} title={m.title} alt={m.title}>
            <Tooltip direction="top" offset={[0, -14]}>
              <div className="text-[12px] leading-snug">
                <div className="font-semibold">{m.title}</div>
                {m.detail && <div className="opacity-75">{m.detail}</div>}
              </div>
            </Tooltip>
          </Marker>
        ))}
      </MapContainer>

      <ul className="pointer-events-none absolute bottom-7 left-3 z-[400] space-y-1 rounded-lg bg-[color:var(--r-bg)] px-3 py-2 text-xs text-[color:var(--r-fg2)] shadow-[var(--r-ring-strong)]">
        {map.legend.map((l) => (
          <li key={l.label} className="flex items-center gap-2">
            <span
              aria-hidden="true"
              className={l.shape === "dot" ? "h-2.5 w-2.5 rounded-full" : "h-2.5 w-3.5 rounded-sm"}
              style={
                l.shape === "dot"
                  ? { background: hex[l.tone] }
                  : { background: `${hex[l.tone]}22`, boxShadow: `inset 0 0 0 1.5px ${hex[l.tone]}` }
              }
            />
            {l.label}
          </li>
        ))}
      </ul>
    </div>
  );
}
