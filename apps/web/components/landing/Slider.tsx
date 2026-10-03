"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

/**
 * Paste-style carousel: one large white card per slide, the next one peeking in on the right,
 * a pill of dots in the center and arrows on the right. Swipe, arrow keys and dots all work.
 * `render(i, active)` lets each slide start its own animation only while it's on screen.
 */
export default function Slider({
  count,
  label,
  render,
  onIndexChange,
  index: controlled,
}: {
  count: number;
  label: string;
  render: (i: number, active: boolean) => React.ReactNode;
  onIndexChange?: (i: number) => void;
  index?: number;
}) {
  const [inner, setInner] = useState(0);
  const index = controlled ?? inner;
  const go = useCallback(
    (i: number) => {
      const next = Math.max(0, Math.min(count - 1, i));
      setInner(next);
      onIndexChange?.(next);
    },
    [count, onIndexChange],
  );

  // Swipe / drag
  const drag = useRef<{ x: number; dx: number } | null>(null);
  const [dx, setDx] = useState(0);

  // Only animate slides while the slider is on screen.
  const rootRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { threshold: 0.35 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={rootRef}
      className="l-slider overflow-x-clip"
      role="region"
      aria-roledescription="carousel"
      aria-label={label}
      onKeyDown={(e) => {
        if (e.key === "ArrowRight") go(index + 1);
        if (e.key === "ArrowLeft") go(index - 1);
      }}
    >
      <div
        className="l-slider-track"
        style={{
          transform: `translateX(calc(${-index} * (var(--slide) + var(--gap)) + ${dx}px))`,
          transition: drag.current ? "none" : undefined,
          touchAction: "pan-y",
        }}
        onPointerDown={(e) => {
          if (e.pointerType === "mouse") return;
          drag.current = { x: e.clientX, dx: 0 };
        }}
        onPointerMove={(e) => {
          if (!drag.current) return;
          drag.current.dx = e.clientX - drag.current.x;
          setDx(drag.current.dx);
        }}
        onPointerUp={() => {
          if (!drag.current) return;
          const d = drag.current.dx;
          drag.current = null;
          setDx(0);
          if (d < -50) go(index + 1);
          else if (d > 50) go(index - 1);
        }}
        onPointerCancel={() => {
          drag.current = null;
          setDx(0);
        }}
      >
        {Array.from({ length: count }, (_, i) => {
          const active = i === index;
          return (
            <div
              key={i}
              role="group"
              aria-roledescription="slide"
              aria-label={`${i + 1} of ${count}`}
              aria-hidden={!active}
              className={`l-slide ${active ? "" : "l-slide-inactive"}`}
              onClick={() => !active && go(i)}
              style={{ opacity: active ? 1 : 0.55, transition: "opacity 600ms ease" }}
            >
              {render(i, active && visible)}
            </div>
          );
        })}
      </div>

      <div className="l-container relative mt-8 flex h-10 items-center justify-center">
        <div className="l-pager" role="tablist" aria-label={`${label}: choose a slide`}>
          {Array.from({ length: count }, (_, i) => (
            <button
              key={i}
              type="button"
              role="tab"
              className="l-dot"
              aria-current={i === index}
              aria-selected={i === index}
              aria-label={`Show slide ${i + 1}`}
              onClick={() => go(i)}
            >
              <span style={{ width: i === index ? 22 : 8 }} />
            </button>
          ))}
        </div>
        <div className="absolute right-0 top-0 hidden gap-2 sm:flex">
          <button type="button" className="l-arrow" onClick={() => go(index - 1)} disabled={index === 0} aria-label="Previous Slide">
            <ChevronLeft size={20} aria-hidden="true" />
          </button>
          <button type="button" className="l-arrow" onClick={() => go(index + 1)} disabled={index === count - 1} aria-label="Next Slide">
            <ChevronRight size={20} aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  );
}
