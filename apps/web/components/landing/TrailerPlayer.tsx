"use client";

import { useEffect, useRef, useState } from "react";
import { Captions, CaptionsOff, Play, Volume2, VolumeX } from "lucide-react";
import { prefersReducedMotion } from "./motion";

const SRC = "/videos/weatherise-trailer-web.mp4";
const POSTER = "/videos/weatherise-trailer.jpg";
const CAPTIONS = "/videos/weatherise-trailer.vtt";

/**
 * Trailer that plays when it scrolls into view.
 * Browsers only allow sound after the visitor interacts with the page, so it first tries to play
 * with sound; if blocked it plays muted (blue speaker button) and unmutes on the first click/key. Loops; captions off by default.
 */
export default function TrailerPlayer() {
  const wrap = useRef<HTMLDivElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const [muted, setMuted] = useState(true);
  const [playing, setPlaying] = useState(false);
  const [captions, setCaptions] = useState(false);
  const userMuted = useRef(false);

  // Play in view (try with sound first), pause out of view.
  useEffect(() => {
    const v = video.current;
    const el = wrap.current;
    if (!v || !el) return;
    const io = new IntersectionObserver(
      async ([e]) => {
        if (e.isIntersecting && e.intersectionRatio >= 0.55) {
          if (prefersReducedMotion()) return;
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
  // Click the video to pause / resume.
  const togglePlay = () => {
    const v = video.current;
    if (!v) return;
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
        loop
        preload="metadata"
        aria-label="Weatherise trailer, 59 seconds, with voiceover"
        onClick={togglePlay}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
      >
        <track kind="captions" src={CAPTIONS} srcLang="en" label="English" />
      </video>

      {/* Big centered control when paused / ended */}
      {!playing && (
        <button
          type="button"
          onClick={togglePlay}
          aria-label="Play Trailer"
          className="absolute left-1/2 top-1/2 flex h-20 w-20 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-[color:var(--l-ink)] shadow-[0_10px_40px_rgba(16,16,16,0.2)] backdrop-blur transition-transform duration-300 hover:scale-105 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[color:var(--l-blue)]"
        >
          <Play size={30} className="ml-1" aria-hidden="true" />
        </button>
      )}

      {/* Top-right: captions + sound, icon only */}
      <div className="absolute right-4 top-4 flex gap-2 md:right-6 md:top-6">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setCaptions((c) => !c);
          }}
          aria-pressed={captions}
          aria-label={captions ? "Turn Captions Off" : "Turn Captions On"}
          className={`flex h-11 w-11 items-center justify-center rounded-full backdrop-blur transition-colors duration-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--l-blue)] ${
            captions ? "bg-[color:var(--l-ink)] text-white" : "bg-white/85 text-[color:var(--l-ink)] shadow-[0_4px_16px_rgba(16,16,16,0.15)]"
          }`}
        >
          {captions ? <Captions size={19} aria-hidden="true" /> : <CaptionsOff size={19} aria-hidden="true" />}
        </button>
        <button
          type="button"
          onClick={toggleSound}
          aria-label={muted ? "Turn Sound On" : "Turn Sound Off"}
          className={`flex h-11 w-11 items-center justify-center rounded-full backdrop-blur transition-colors duration-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--l-blue)] ${
            muted ? "bg-[color:var(--l-blue)] text-white shadow-[0_8px_24px_rgba(0,136,255,0.35)]" : "bg-white/85 text-[color:var(--l-ink)] shadow-[0_4px_16px_rgba(16,16,16,0.15)]"
          }`}
        >
          {muted ? <VolumeX size={19} aria-hidden="true" /> : <Volume2 size={19} aria-hidden="true" />}
        </button>
      </div>
    </div>
  );
}
