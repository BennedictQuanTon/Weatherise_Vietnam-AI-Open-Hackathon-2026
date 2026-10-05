"use client";

import { useEffect, useRef, useState } from "react";
import { Captions, CaptionsOff, Play, Volume2, VolumeX } from "lucide-react";
import { useInlineVideo, useSyncedAudio } from "./useInlineVideo";
import { VideoDebug, useVideoLog } from "./VideoDebug";

// Silent loop (WebM first, MP4 fallback) + the soundtrack as its own file; see video/web-cuts.mjs.
const WEBM = "/videos/weatherise-trailer-loop.webm";
const MP4 = "/videos/weatherise-trailer-loop.mp4";
const AUDIO = "/videos/weatherise-trailer-audio.m4a";
const POSTER = "/videos/weatherise-trailer.jpg";
const CAPTIONS = "/videos/weatherise-trailer.vtt";

/**
 * Trailer that plays silently and loops whenever it is on screen, on every device.
 * Sound is a tap away: the speaker button, or a tap on the video, starts the soundtrack in sync.
 * On desktop the first click or key press anywhere also turns the sound on. Once sound is on, a tap pauses / resumes.
 */
export default function TrailerPlayer() {
  const video = useRef<HTMLVideoElement>(null);
  const audio = useRef<HTMLAudioElement>(null);
  const userPaused = useRef(false);
  // Turned off with the speaker button: never switched back on by itself.
  const userMuted = useRef(false);
  const { playing } = useInlineVideo(video, true, userPaused);
  const { soundOn, enable, disable } = useSyncedAudio(video, audio);
  const [captions, setCaptions] = useState(false);
  const { lines } = useVideoLog(video);

  // Desktop: the first click or key press anywhere turns the sound on (both count as user activation).
  useEffect(() => {
    if (!window.matchMedia("(pointer: fine)").matches) return;
    const unlock = () => {
      if (!userMuted.current && video.current && !video.current.paused) enable();
    };
    window.addEventListener("click", unlock, { once: true });
    window.addEventListener("keydown", unlock, { once: true });
    return () => {
      window.removeEventListener("click", unlock);
      window.removeEventListener("keydown", unlock);
    };
  }, [enable]);

  useEffect(() => {
    const t = video.current?.textTracks?.[0];
    if (t) t.mode = captions ? "showing" : "hidden";
  }, [captions]);

  const toggleSound = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (soundOn) {
      userMuted.current = true;
      disable();
    } else {
      userMuted.current = false;
      userPaused.current = false;
      enable();
    }
  };

  // Play button / tap on a paused video: resume, with sound unless the visitor turned it off.
  const resume = () => {
    userPaused.current = false;
    if (!userMuted.current) enable();
    else video.current?.play().catch(() => {});
  };
  // Tap on the playing video: the first tap brings the sound in; after that it pauses.
  const onVideoTap = (e: React.MouseEvent) => {
    e.stopPropagation();
    const v = video.current;
    if (!v) return;
    if (v.paused) return resume();
    if (!soundOn && !userMuted.current) return void enable();
    userPaused.current = true;
    v.pause();
  };

  return (
    <div className="group relative overflow-hidden rounded-[32px] bg-white shadow-[0_0_0_1px_rgba(16,16,16,0.06),0_30px_80px_rgba(16,16,16,0.12)] md:rounded-[40px]">
      <video
        ref={video}
        className="block aspect-video w-full cursor-pointer bg-white"
        poster={POSTER}
        muted
        loop
        playsInline
        preload="none"
        aria-label="Weatherise trailer, 60 seconds"
        onClick={onVideoTap}
      >
        <source src={WEBM} type="video/webm" />
        <source src={MP4} type="video/mp4" />
        <track kind="captions" src={CAPTIONS} srcLang="en" label="English" />
      </video>
      <audio ref={audio} src={AUDIO} preload="none" />

      {/* Shown only while the video is not moving (paused, or the browser refused to start it) */}
      {!playing && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            resume();
          }}
          aria-label="Play Trailer"
          className="absolute left-1/2 top-1/2 flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white text-[color:var(--l-ink)] shadow-[0_10px_40px_rgba(16,16,16,0.2)] transition-transform duration-300 hover:scale-105 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[color:var(--l-blue)] md:h-20 md:w-20"
        >
          <Play size={30} className="ml-1" aria-hidden="true" />
        </button>
      )}

      {/* Top-right: captions + sound, icon only */}
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
          aria-label={soundOn ? "Turn Sound Off" : "Turn Sound On"}
          className={`flex h-11 w-11 items-center justify-center rounded-full transition-colors duration-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--l-blue)] ${
            soundOn ? "bg-white text-[color:var(--l-ink)] shadow-[0_4px_16px_rgba(16,16,16,0.15)]" : "bg-[color:var(--l-blue)] text-white shadow-[0_8px_24px_rgba(0,136,255,0.35)]"
          }`}
        >
          {soundOn ? <Volume2 size={19} aria-hidden="true" /> : <VolumeX size={19} aria-hidden="true" />}
        </button>
      </div>

      <VideoDebug video={video} lines={lines} />
    </div>
  );
}
