"use client";

import { useCallback, useEffect, useRef, useState } from "react";

// On-device diagnostics for the trailer: open the site with ?debug=video (e.g. on an iPhone) and the player shows
// its live state and recent media events, so a playback problem can be read off a single screenshot.
const enabled = () => typeof window !== "undefined" && new URLSearchParams(window.location.search).get("debug") === "video";

export function useVideoLog(ref: React.RefObject<HTMLVideoElement>) {
  const [lines, setLines] = useState<string[]>([]);
  const on = useRef(false);
  const log = useCallback((m: string) => {
    if (on.current) setLines((l) => [...l.slice(-11), `${(performance.now() / 1000).toFixed(1)}s ${m}`]);
  }, []);

  useEffect(() => {
    on.current = enabled();
    const v = ref.current;
    if (!on.current || !v) return;
    const types = ["loadstart", "loadedmetadata", "loadeddata", "canplay", "playing", "pause", "waiting", "stalled", "suspend", "abort", "emptied", "error"];
    const onEvent = (e: Event) => log(e.type + (e.type === "error" && v.error ? ` code=${v.error.code}` : ""));
    types.forEach((t) => v.addEventListener(t, onEvent));
    // Log every play() outcome too: a rejection names the browser policy that blocked it.
    const play = v.play.bind(v);
    v.play = () => {
      const p = play();
      p.then(
        () => log(`play() ok, muted=${v.muted}`),
        (err: DOMException) => log(`play() rejected: ${err.name}`),
      );
      return p;
    };
    return () => types.forEach((t) => v.removeEventListener(t, onEvent));
  }, [ref, log]);

  return { log, lines };
}

export function VideoDebug({ video, lines }: { video: React.RefObject<HTMLVideoElement>; lines: string[] }) {
  const [state, setState] = useState<string | null>(null);
  useEffect(() => {
    if (!enabled()) return;
    const tick = () => {
      const v = video.current;
      if (!v) return;
      setState(
        [
          `src ${v.currentSrc.split("/").pop() || "(none)"}`,
          `ready ${v.readyState} net ${v.networkState} err ${v.error ? `${v.error.code} ${v.error.message}` : "none"}`,
          `paused ${v.paused} muted ${v.muted} t ${v.currentTime.toFixed(1)}s`,
          `screen ${window.innerWidth}×${window.innerHeight} · ${navigator.userAgent.replace(/^Mozilla\/5\.0 /, "").slice(0, 90)}`,
        ].join("\n"),
      );
    };
    tick();
    const id = window.setInterval(tick, 500);
    return () => window.clearInterval(id);
  }, [video]);
  if (state === null) return null;
  return (
    <pre className="pointer-events-none absolute inset-x-2 bottom-2 z-20 max-h-[80%] overflow-hidden whitespace-pre-wrap rounded-lg bg-black/80 p-2 text-left font-mono text-[10px] leading-snug text-white">
      {state}
      {"\n"}
      {/* newest first, so the latest events are never cut off */}
      {[...lines].reverse().join("\n")}
    </pre>
  );
}
