"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Plays a muted inline <video> while `want` is true and at least a quarter of it is on screen; pauses it otherwise.
 * The videos have no audio track (see video/web-cuts.mjs), the case browsers autoplay most readily, iPhone and iPad
 * included. If a play() is still refused (iOS can pause muted video while it is fading in, or in Low Power Mode),
 * it retries once a second while the video should be running, and reports `blocked` so the UI can offer a Play button.
 */
export function useInlineVideo(ref: React.RefObject<HTMLVideoElement>, want: boolean, userPaused?: React.MutableRefObject<boolean>) {
  const [playing, setPlaying] = useState(false);
  const [blocked, setBlocked] = useState(false);
  const inView = useRef(false);

  // Muted + inline for real: React 18 sets the muted property but not the attribute, and iOS checks the attribute.
  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    v.muted = true;
    v.defaultMuted = true;
    v.setAttribute("muted", "");
    v.setAttribute("playsinline", "");
  }, [ref]);

  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    const on = () => {
      setPlaying(true);
      setBlocked(false);
    };
    const off = () => setPlaying(false);
    v.addEventListener("playing", on);
    v.addEventListener("pause", off);
    v.addEventListener("ended", off);
    const io = new IntersectionObserver(
      ([e]) => {
        inView.current = e.isIntersecting;
        if (!e.isIntersecting && !v.paused) v.pause();
      },
      { threshold: 0.25 },
    );
    io.observe(v);
    return () => {
      io.disconnect();
      v.removeEventListener("playing", on);
      v.removeEventListener("pause", off);
      v.removeEventListener("ended", off);
    };
  }, [ref]);

  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    if (!want) {
      if (!v.paused) v.pause();
      return;
    }
    let refusals = 0;
    const tick = () => {
      if (!inView.current || userPaused?.current || document.hidden || !v.paused || v.ended) return;
      v.play().then(
        () => (refusals = 0),
        () => {
          refusals += 1;
          if (refusals >= 3) setBlocked(true);
        },
      );
    };
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [ref, want, userPaused]);

  return { playing, blocked };
}

/**
 * Sound for a silent video: a separate <audio> element kept in step with the video's clock. It only starts from a
 * real tap / click (the one way every browser allows sound), then follows the video: pause, resume, loop, seek.
 */
export function useSyncedAudio(video: React.RefObject<HTMLVideoElement>, audio: React.RefObject<HTMLAudioElement>) {
  const [soundOn, setSoundOn] = useState(false);
  const on = useRef(false);

  useEffect(() => {
    const v = video.current;
    const a = audio.current;
    if (!v || !a) return;
    const follow = () => {
      if (!on.current) return;
      if (Math.abs(a.currentTime - v.currentTime) > 0.25) a.currentTime = v.currentTime;
      if (a.paused && !v.paused) a.play().catch(() => {});
    };
    const hold = () => a.pause();
    v.addEventListener("timeupdate", follow);
    v.addEventListener("playing", follow);
    v.addEventListener("pause", hold);
    return () => {
      v.removeEventListener("timeupdate", follow);
      v.removeEventListener("playing", follow);
      v.removeEventListener("pause", hold);
    };
  }, [video, audio]);

  /** Call from a tap / click handler. Resolves false if the browser still refuses sound. */
  const enable = useCallback(async () => {
    const v = video.current;
    const a = audio.current;
    if (!v || !a) return false;
    on.current = true;
    setSoundOn(true);
    a.currentTime = v.currentTime;
    if (v.paused) v.play().catch(() => {});
    try {
      await a.play();
      return true;
    } catch {
      on.current = false;
      setSoundOn(false);
      return false;
    }
  }, [video, audio]);

  const disable = useCallback(() => {
    on.current = false;
    setSoundOn(false);
    audio.current?.pause();
  }, [audio]);

  return { soundOn, enable, disable };
}
