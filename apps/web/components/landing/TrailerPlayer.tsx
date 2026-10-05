"use client";

import { useEffect, useRef, useState } from "react";
import { Captions, CaptionsOff, Play, Volume2, VolumeX } from "lucide-react";
import { useInlineVideo, useVideoSrc } from "./useInlineVideo";

const SRC = "/videos/weatherise-trailer-web.mp4";
// 720p cut for phones: lighter on mobile data, same picture.
const SRC_MOBILE = "/videos/weatherise-trailer-mobile.mp4";
const POSTER = "/videos/weatherise-trailer.jpg";
const CAPTIONS = "/videos/weatherise-trailer.vtt";

/**
 * Trailer that plays muted while on screen and loops (see useInlineVideo for why it keeps retrying on iOS).
 * Sound comes on with the speaker button or, on desktop, the first click or key press. Touch devices stay muted
 * until the speaker is tapped: iOS pauses a video that is unmuted outside a real tap. Tap the video to pause.
 */
export default function TrailerPlayer() {
  const video = useRef<HTMLVideoElement>(null);
  const userPaused = useRef(false);
  const src = useVideoSrc(SRC, SRC_MOBILE);
  const { playing } = useInlineVideo(video, true, userPaused);
  const [muted, setMuted] = useState(true);
  const [captions, setCaptions] = useState(false);
  // No playable file at all: show the poster instead of an empty box.
  const [failed, setFailed] = useState(false);

  // Desktop: the first click or key press anywhere turns the sound on (both are real user activations).
  useEffect(() => {
    if (!window.matchMedia("(pointer: fine)").matches) return;
    const unlock = () => {
      const v = video.current;
      if (v && v.muted && !v.paused) unmute(v);
    };
    window.addEventListener("click", unlock, { once: true });
    window.addEventListener("keydown", unlock, { once: true });
    return () => {
      window.removeEventListener("click", unlock);
      window.removeEventListener("keydown", unlock);
    };
  }, []);

  useEffect(() => {
    const t = video.current?.textTracks?.[0];
    if (t) t.mode = captions ? "showing" : "hidden";
  }, [captions, src]);

  // Unmute without ever leaving the video stuck: if the browser refuses, fall back to muted playback.
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
      userPaused.current = false;
      unmute(v);
    } else {
      v.muted = true;
      setMuted(true);
    }
  };

  // Tap / click the video (or the Play button) to pause or resume.
  const togglePlay = () => {
    const v = video.current;
    if (!v) return;
    if (v.paused) {
      userPaused.current = false;
      v.play().catch(() => {});
    } else {
      userPaused.current = true;
      v.pause();
    }
  };

  return (
    <div className="group relative overflow-hidden rounded-[32px] bg-white shadow-[0_0_0_1px_rgba(16,16,16,0.06),0_30px_80px_rgba(16,16,16,0.12)] md:rounded-[40px]">
      <video
        ref={video}
        className="block aspect-video w-full cursor-pointer bg-white"
        src={src}
        poster={POSTER}
        playsInline
        muted
        loop
        preload="metadata"
        aria-label="Weatherise trailer, 60 seconds, with voiceover"
        onClick={togglePlay}
        onError={() => setFailed(true)}
      >
        <track kind="captions" src={CAPTIONS} srcLang="en" label="English" />
      </video>

      {failed && <img src={POSTER} alt="Weatherise trailer" className="absolute inset-0 h-full w-full object-cover" />}

      {/* Play button whenever the video is not actually moving (loading, paused by the visitor, or autoplay refused).
          A tap always may start playback, even when the browser blocks autoplay. */}
      {!playing && (
        failed ? (
          <a
            href={SRC}
            target="_blank"
            rel="noreferrer"
            aria-label="Open the trailer"
            className="absolute left-1/2 top-1/2 flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white text-[color:var(--l-ink)] shadow-[0_10px_40px_rgba(16,16,16,0.2)] md:h-20 md:w-20"
          >
            <Play size={30} className="ml-1" aria-hidden="true" />
          </a>
        ) : (
          <button
            type="button"
            onClick={togglePlay}
            aria-label="Play Trailer"
            className="absolute left-1/2 top-1/2 flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white text-[color:var(--l-ink)] shadow-[0_10px_40px_rgba(16,16,16,0.2)] transition-transform duration-300 hover:scale-105 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[color:var(--l-blue)] md:h-20 md:w-20"
          >
            <Play size={30} className="ml-1" aria-hidden="true" />
          </button>
        )
      )}

      {/* Top-right: captions + sound, icon only (solid backgrounds: iOS can stop drawing a video under backdrop-filter) */}
      {!failed && (
        <div className="absolute right-3 top-3 flex gap-2 md:right-6 md:top-6">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setCaptions((c) => !c);
            }}
            aria-pressed={captions}
            aria-label={captions ? "Turn Captions Off" : "Turn Captions On"}
            className={`flex h-11 w-11 items-center justify-center rounded-full transition-colors duration-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--l-blue)] ${
              captions ? "bg-[color:var(--l-ink)] text-white" : "bg-white text-[color:var(--l-ink)] shadow-[0_4px_16px_rgba(16,16,16,0.15)]"
            }`}
          >
            {captions ? <Captions size={19} aria-hidden="true" /> : <CaptionsOff size={19} aria-hidden="true" />}
          </button>
          <button
            type="button"
            onClick={toggleSound}
            aria-label={muted ? "Turn Sound On" : "Turn Sound Off"}
            className={`flex h-11 w-11 items-center justify-center rounded-full transition-colors duration-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--l-blue)] ${
              muted ? "bg-[color:var(--l-blue)] text-white shadow-[0_8px_24px_rgba(0,136,255,0.35)]" : "bg-white text-[color:var(--l-ink)] shadow-[0_4px_16px_rgba(16,16,16,0.15)]"
            }`}
          >
            {muted ? <VolumeX size={19} aria-hidden="true" /> : <Volume2 size={19} aria-hidden="true" />}
          </button>
        </div>
      )}
    </div>
  );
}
