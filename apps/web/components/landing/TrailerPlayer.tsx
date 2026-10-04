"use client";

import { useEffect, useRef, useState } from "react";
import { Pause, Play, RotateCcw, Volume2, VolumeX } from "lucide-react";
import { prefersReducedMotion } from "./motion";

const SRC = "/videos/weatherise-trailer-web.mp4";
const POSTER = "/videos/weatherise-trailer.jpg";
const CAPTIONS = "/videos/weatherise-trailer.vtt";

/**
 * Trailer that plays when it scrolls into view.
 * Browsers only allow sound after the visitor interacts with the page, so it first tries to play
 * with sound; if blocked it plays muted, shows "Tap for Sound", and unmutes on the first click/key.
 */
export default function TrailerPlayer() {
  const wrap = useRef<HTMLDivElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const [muted, setMuted] = useState(true);
  const [playing, setPlaying] = useState(false);
  const [ended, setEnded] = useState(false);
  const [progress, setProgress] = useState(0);
  const [captions, setCaptions] = useState(true);
  const userMuted = useRef(false);

  // Play in view (try with sound first), pause out of view.
  useEffect(() => {
    const v = video.current;
    const el = wrap.current;
    if (!v || !el) return;
    const io = new IntersectionObserver(
      async ([e]) => {
        if (e.isIntersecting && e.intersectionRatio >= 0.55) {
          if (prefersReducedMotion() || v.ended) return;
          if (!userMuted.current) {
            v.muted = false;
            try {
              await v.play();
              setMuted(false);
              return;
            } catch {
              v.muted = true;
              setMuted(true);
            }
          }
          v.play().catch(() => {});
        } else if (!v.paused) {
          v.pause();
        }
      },
      { threshold: [0, 0.55] },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // First interaction anywhere on the page unlocks sound (if the visitor hasn't muted it themselves).
  useEffect(() => {
    const unlock = () => {
      const v = video.current;
      if (v && v.muted && !userMuted.current && !v.paused) {
        v.muted = false;
        setMuted(false);
      }
    };
    window.addEventListener("pointerdown", unlock, { once: true });
    window.addEventListener("keydown", unlock, { once: true });
    return () => {
      window.removeEventListener("pointerdown", unlock);
      window.removeEventListener("keydown", unlock);
    };
  }, []);

  // Caption track on/off
  useEffect(() => {
    const t = video.current?.textTracks?.[0];
    if (t) t.mode = captions ? "showing" : "hidden";
  }, [captions]);

  const toggleSound = (e: React.MouseEvent) => {
    e.stopPropagation();
    const v = video.current;
    if (!v) return;
    v.muted = !v.muted;
    userMuted.current = v.muted;
    setMuted(v.muted);
    if (v.paused) v.play().catch(() => {});
  };
  const togglePlay = () => {
    const v = video.current;
    if (!v) return;
    if (v.ended) {
      v.currentTime = 0;
      setEnded(false);
    }
    if (v.paused) v.play().catch(() => {});
    else v.pause();
  };

  return (
    <div ref={wrap} className="group relative overflow-hidden rounded-[32px] bg-white shadow-[0_0_0_1px_rgba(16,16,16,0.06),0_30px_80px_rgba(16,16,16,0.12)] md:rounded-[40px]">
      <video
        ref={video}
        className="block aspect-video w-full cursor-pointer bg-white"
        src={SRC}
        poster={POSTER}
        playsInline
        muted
        preload="metadata"
        aria-label="Weatherise trailer, 59 seconds, with voiceover"
        onClick={togglePlay}
        onPlay={() => {
          setPlaying(true);
          setEnded(false);
        }}
        onPause={() => setPlaying(false)}
        onEnded={() => {
          setPlaying(false);
          setEnded(true);
        }}
        onTimeUpdate={(e) => setProgress(e.currentTarget.currentTime / (e.currentTarget.duration || 1))}
      >
        <track kind="captions" src={CAPTIONS} srcLang="en" label="English" default />
      </video>

      {/* Big centered control when paused / ended */}
      {!playing && (
        <button
          type="button"
          onClick={togglePlay}
          aria-label={ended ? "Replay Trailer" : "Play Trailer"}
          className="absolute left-1/2 top-1/2 flex h-20 w-20 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-[color:var(--l-ink)] shadow-[0_10px_40px_rgba(16,16,16,0.2)] backdrop-blur transition-transform duration-300 hover:scale-105 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[color:var(--l-blue)]"
        >
          {ended ? <RotateCcw size={30} aria-hidden="true" /> : <Play size={30} className="ml-1" aria-hidden="true" />}
        </button>
      )}

      {/* Sound pill: prominent while muted */}
      <button
        type="button"
        onClick={toggleSound}
        aria-label={muted ? "Turn Sound On" : "Turn Sound Off"}
        className={`absolute right-4 top-4 inline-flex h-11 items-center gap-2 rounded-full px-4 text-[15px] font-semibold backdrop-blur transition-colors duration-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--l-blue)] md:right-6 md:top-6 ${
          muted ? "bg-[color:var(--l-blue)] text-white shadow-[0_8px_24px_rgba(0,136,255,0.35)]" : "bg-white/85 text-[color:var(--l-ink)] shadow-[0_4px_16px_rgba(16,16,16,0.15)]"
        }`}
      >
        {muted ? <VolumeX size={18} aria-hidden="true" /> : <Volume2 size={18} aria-hidden="true" />}
        <span className="max-sm:sr-only">{muted ? "Tap for Sound" : "Sound On"}</span>
      </button>

      {/* Bottom bar: play/pause, CC, progress */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-center gap-3 p-4 opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-within:opacity-100 md:p-6">
        <button
          type="button"
          onClick={togglePlay}
          aria-label={playing ? "Pause Trailer" : "Play Trailer"}
          className="pointer-events-auto flex h-10 w-10 items-center justify-center rounded-full bg-white/85 text-[color:var(--l-ink)] backdrop-blur"
        >
          {playing ? <Pause size={17} aria-hidden="true" /> : <Play size={17} className="ml-0.5" aria-hidden="true" />}
        </button>
        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/70 backdrop-blur" aria-hidden="true">
          <div className="h-full rounded-full" style={{ width: `${progress * 100}%`, background: "var(--l-brand)" }} />
        </div>
        <button
          type="button"
          onClick={() => setCaptions((c) => !c)}
          aria-pressed={captions}
          aria-label="Captions"
          className={`pointer-events-auto flex h-10 items-center rounded-full px-3 text-[13px] font-bold backdrop-blur ${captions ? "bg-[color:var(--l-ink)] text-white" : "bg-white/85 text-[color:var(--l-ink)]"}`}
        >
          CC
        </button>
      </div>
    </div>
  );
}
