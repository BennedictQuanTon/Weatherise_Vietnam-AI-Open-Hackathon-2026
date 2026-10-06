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
 * Sound for a silent video: a separate <audio> element, started only from a real tap / click (the one way every
 * browser allows sound).
 *
 * The soundtrack is the master clock and is never seeked while it plays: on phones the two clocks drift and the
 * audio needs network time to resume, so re-seeking the audio to match the video caused an endless loop of audible
 * jumps (28 re-seeks in 20 s on a 400 ms connection). Instead the silent video follows the audio: small drift is
 * absorbed by nudging the video's playback rate (±3–10 %), large drift by one invisible video seek. The soundtrack is
 * preloaded once the video starts, so sound comes in without a wait, and it loops along with the video.
 */
export function useSyncedAudio(video: React.RefObject<HTMLVideoElement>, audio: React.RefObject<HTMLAudioElement>) {
  const [soundOn, setSoundOn] = useState(false);
  const on = useRef(false);

  useEffect(() => {
    const v = video.current;
    const a = audio.current;
    if (!v || !a) return;
    a.loop = v.loop;

    // Fetch the soundtrack as soon as the video actually plays, so a tap has nothing to wait for.
    const preload = () => {
      if (a.preload !== "auto") {
        a.preload = "auto";
        a.load();
      }
    };
    // Video resumed (after a pause, or back on screen): bring the sound back from where the picture is.
    const resume = () => {
      preload();
      if (on.current && a.paused) {
        a.currentTime = v.currentTime;
        a.play().catch(() => {});
      }
    };
    const hold = () => {
      a.pause();
      v.playbackRate = 1;
    };
    // Audio just started (or restarted): line the picture up with it once.
    const align = () => {
      if (on.current && Math.abs(v.currentTime - a.currentTime) > 0.08) v.currentTime = a.currentTime;
    };
    v.addEventListener("playing", resume);
    v.addEventListener("pause", hold);
    a.addEventListener("playing", align);

    // Keep the picture on the sound's clock.
    const id = window.setInterval(() => {
      if (!on.current || a.paused || v.paused || v.seeking) return;
      let drift = v.currentTime - a.currentTime; // > 0: picture ahead of the sound
      const dur = a.duration || v.duration;
      if (v.loop && dur) {
        if (drift > dur / 2) drift -= dur;
        else if (drift < -dur / 2) drift += dur;
      }
      const off = Math.abs(drift);
      if (off > 0.5) {
        v.currentTime = a.currentTime;
        v.playbackRate = 1;
      } else if (off > 0.04) {
        // Catch up fast while far off (±10 %), gently when close (±3 %): both are invisible on a silent picture.
        const nudge = off > 0.15 ? 0.1 : 0.03;
        v.playbackRate = drift > 0 ? 1 - nudge : 1 + nudge;
      } else if (v.playbackRate !== 1) {
        v.playbackRate = 1;
      }
    }, 200);

    return () => {
      window.clearInterval(id);
      v.removeEventListener("playing", resume);
      v.removeEventListener("pause", hold);
      a.removeEventListener("playing", align);
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
    if (video.current) video.current.playbackRate = 1;
  }, [video, audio]);

  return { soundOn, enable, disable };
}
