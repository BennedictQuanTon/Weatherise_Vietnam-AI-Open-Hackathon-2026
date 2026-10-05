"use client";

import { useEffect, useRef, useState } from "react";

/** Phones (≤ 767 px) get the lighter cut. Chosen after mount, so the server HTML and hydration agree. */
export function useVideoSrc(desktop: string, mobile: string) {
  const [chosen, setChosen] = useState<string | undefined>(undefined);
  useEffect(() => {
    setChosen(window.matchMedia("(max-width: 767px)").matches ? mobile : desktop);
  }, [desktop, mobile]);
  return chosen;
}

/**
 * Keeps a muted inline <video> playing while `want` is true and it is on screen.
 *
 * iOS Safari only lets muted video autoplay while it is visible, and an ancestor still at opacity 0 (a reveal
 * animation) counts as invisible: play() is refused or the video is paused right away, and Safari does not
 * resume a script-started video by itself. So rather than a single play() call, this retries once a second
 * while the video should be running. `playing` follows real playback (the "playing" event, not "play"), and
 * `blocked` turns on when the browser keeps refusing (e.g. Low Power Mode) so the UI can offer a Play button.
 * Videos have a pause control, so this autoplays even with Reduce Motion on (iOS users often enable it).
 * `soundFirst`: on desktop, try with sound once (allowed for sites the visitor has engaged with), else muted.
 */
export function useInlineVideo(
  ref: React.RefObject<HTMLVideoElement>,
  want: boolean,
  { userPaused, soundFirst = false }: { userPaused?: React.MutableRefObject<boolean>; soundFirst?: boolean } = {},
) {
  const [playing, setPlaying] = useState(false);
  const [blocked, setBlocked] = useState(false);
  const inView = useRef(false);

  // Muted + inline for real: React sets the muted property but not the attribute, and iOS checks the attribute.
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
    v.addEventListener("emptied", off);
    const io = new IntersectionObserver(
      ([e]) => {
        inView.current = e.isIntersecting;
        if (!e.isIntersecting && !v.paused) v.pause();
      },
      { threshold: 0.2 },
    );
    io.observe(v);
    return () => {
      io.disconnect();
      v.removeEventListener("playing", on);
      v.removeEventListener("pause", off);
      v.removeEventListener("ended", off);
      v.removeEventListener("emptied", off);
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
    let triedSound = !soundFirst || !window.matchMedia("(pointer: fine)").matches;
    const tick = () => {
      if (!inView.current || userPaused?.current || document.hidden || !v.paused || v.ended || !v.currentSrc) return;
      if (!triedSound) {
        triedSound = true;
        v.muted = false;
        v.play().catch(() => {
          v.muted = true;
          v.play().catch(() => {});
        });
        return;
      }
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
  }, [ref, want, userPaused, soundFirst]);

  return { playing, blocked };
}
