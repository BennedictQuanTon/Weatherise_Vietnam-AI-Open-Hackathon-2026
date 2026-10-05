"use client";

import { useEffect, useRef, useState } from "react";
import { Captions, CaptionsOff, Play, Volume2, VolumeX } from "lucide-react";
import { prefersReducedMotion } from "./motion";

const SRC = "/videos/weatherise-trailer-web.mp4";
// 720p cut for phones: lighter on mobile data, same picture.
const SRC_MOBILE = "/videos/weatherise-trailer-mobile.mp4";
const POSTER = "/videos/weatherise-trailer.jpg";
const CAPTIONS = "/videos/weatherise-trailer.vtt";

/**
 * Trailer that plays (muted) when it scrolls into view, the one autoplay every browser allows.
 * On desktop it first tries with sound. Sound comes on with the speaker button or, on desktop, the first click or key press.
 * Touch devices are left muted until the speaker button is tapped: iOS pauses a video that is unmuted outside a real tap,
 * and the touch that starts a scroll does not count as one. If autoplay is blocked (e.g. iOS Low Power Mode), the Play button shows.
 */
export default function TrailerPlayer() {
  const wrap = useRef<HTMLDivElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const [muted, setMuted] = useState(true);
  const [playing, setPlaying] = useState(false);
  const [captions, setCaptions] = useState(false);
  // No playable source (e.g. a decoder that rejects the file): show the poster instead of an empty box.
  const [failed, setFailed] = useState(false);
  const userMuted = useRef(false);

  // Start muted for real: React sets the property but not the attribute, and iOS checks both before allowing autoplay.
  useEffect(() => {
    const v = video.current;
    if (!v) return;
    v.muted = true;
    v.defaultMuted = true;
    v.setAttribute("muted", "");
  }, []);

  // Play in view, pause out of view.
  useEffect(() => {
    const v = video.current;
    const el = wrap.current;
    if (!v || !el) return;
    const finePointer = window.matchMedia("(pointer: fine)").matches;
    const io = new IntersectionObserver(
      async ([e]) => {
        if (e.isIntersecting && e.intersectionRatio >= 0.5) {
          if (prefersReducedMotion() || !v.paused) return;
          if (finePointer && !userMuted.current) {
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
      { threshold: [0, 0.5] },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // Desktop: the first click or key press anywhere turns the sound on (both are real user activations, unlike pointerdown on touch).
  useEffect(() => {
    if (!window.matchMedia("(pointer: fine)").matches) return;
    const unlock = () => {
      const v = video.current;
      if (v && v.muted && !userMuted.current && !v.paused) unmute(v);
    };
    window.addEventListener("click", unlock, { once: true });
    window.addEventListener("keydown", unlock, { once: true });
    return () => {
      window.removeEventListener("click", unlock);
      window.removeEventListener("keydown", unlock);
    };
  }, []);

  // Caption track on/off
  useEffect(() => {
    const t = video.current?.textTracks?.[0];
    if (t) t.mode = captions ? "showing" : "hidden";
  }, [captions]);

  // Unmute without ever leaving the video stuck: if the browser pauses it, resume; if it refuses, fall back to muted.
  const unmute = (v: HTMLVideoElement) => {
    v.muted = false;
    setMuted(false);
    if (v.paused) {
      v.play().catch(() => {
        v.muted = true;
        setMuted(true);
        v.play().catch(() => {});
      });
    }
  };

  const toggleSound = (e: React.MouseEvent) => {
    e.stopPropagation();
    const v = video.current;
    if (!v) return;
    if (v.muted) {
      userMuted.current = false;
      unmute(v);
    } else {
      v.muted = true;
      userMuted.current = true;
      setMuted(true);
    }
  };
  // Tap / click the video to pause or resume.
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
        poster={POSTER}
        playsInline
        muted
        loop
        preload="metadata"
        aria-label="Weatherise trailer, 60 seconds, with voiceover"
        onClick={togglePlay}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
      >
        <source src={SRC_MOBILE} type="video/mp4" media="(max-width: 767px)" />
        <source src={SRC} type="video/mp4" onError={() => setFailed(true)} />
        <track kind="captions" src={CAPTIONS} srcLang="en" label="English" />
      </video>

      {failed && <img src={POSTER} alt="Weatherise trailer" className="absolute inset-0 h-full w-full object-cover" />}

      {/* Big centered control when paused, or when the browser blocked autoplay */}
      {!playing && !failed && (
        <button
          type="button"
          onClick={togglePlay}
          aria-label="Play Trailer"
          className="absolute left-1/2 top-1/2 flex h-20 w-20 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-[color:var(--l-ink)] shadow-[0_10px_40px_rgba(16,16,16,0.2)] backdrop-blur transition-transform duration-300 hover:scale-105 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[color:var(--l-blue)] max-sm:h-16 max-sm:w-16"
        >
          <Play size={30} className="ml-1" aria-hidden="true" />
        </button>
      )}

      {/* Top-right: captions + sound, icon only */}
      <div className="absolute right-4 top-4 flex gap-2 max-sm:right-3 max-sm:top-3 md:right-6 md:top-6">
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
