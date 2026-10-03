"use client";

import { useEffect, useRef, useState } from "react";

export function prefersReducedMotion() {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/** True once the element has scrolled into view (fires once). */
export function useInView<T extends Element>(options: IntersectionObserverInit = { threshold: 0.2, rootMargin: "0px 0px -8% 0px" }) {
  const ref = useRef<T>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (prefersReducedMotion()) {
      setInView(true);
      return;
    }
    const io = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setInView(true);
        io.disconnect();
      }
    }, options);
    io.observe(el);
    return () => io.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return [ref, inView] as const;
}

export function Reveal({
  children,
  delay = 0,
  className = "",
  as: Tag = "div",
  scale = false,
  immediate = false,
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
  as?: "div" | "section" | "li" | "header" | "p" | "span";
  scale?: boolean;
  immediate?: boolean; // reveal as soon as any part is on screen (above-the-fold content)
}) {
  const [ref, inView] = useInView<HTMLDivElement>(immediate ? { threshold: 0 } : undefined);
  const Comp = Tag as any;
  return (
    <Comp
      ref={ref}
      className={`${scale ? "l-reveal-scale" : "l-reveal"} ${inView ? "is-in" : ""} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </Comp>
  );
}

/** Headline whose lines slide up from behind a mask, one after another. */
export function MaskHeading({
  lines,
  className = "",
  as: Tag = "h2",
  stagger = 110,
  id,
}: {
  lines: React.ReactNode[];
  className?: string;
  as?: "h1" | "h2" | "h3";
  stagger?: number;
  id?: string;
}) {
  const [ref, inView] = useInView<HTMLHeadingElement>();
  const Comp = Tag as any;
  return (
    <Comp ref={ref} id={id} className={`${className} ${inView ? "is-in" : ""}`}>
      {lines.map((line, i) => (
        <span key={i}>
          {i > 0 && " "}
          <span className="l-mask">
            <span style={{ transitionDelay: `${i * stagger}ms` }}>{line}</span>
          </span>
        </span>
      ))}
    </Comp>
  );
}

/** Number that counts up from `from` when it scrolls into view. */
export function CountUp({
  value,
  from = 0,
  decimals = 0,
  prefix = "",
  suffix = "",
  duration = 1600,
  className = "",
}: {
  value: number;
  from?: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  duration?: number;
  className?: string;
}) {
  const [ref, inView] = useInView<HTMLSpanElement>({ threshold: 0.6 });
  const [shown, setShown] = useState(from);
  useEffect(() => {
    if (!inView) return;
    if (prefersReducedMotion()) {
      setShown(value);
      return;
    }
    let raf = 0;
    const t0 = performance.now();
    const tick = (t: number) => {
      const p = Math.min(1, (t - t0) / duration);
      const eased = 1 - Math.pow(1 - p, 4);
      setShown(from + (value - from) * eased);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, value, from, duration]);
  const text = shown.toLocaleString("en-US", { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
  return (
    <span ref={ref} className={`tnum ${className}`} aria-label={`${prefix}${value.toLocaleString("en-US", { minimumFractionDigits: decimals })}${suffix}`}>
      <span aria-hidden="true">
        {prefix}
        {text}
        {suffix}
      </span>
    </span>
  );
}

/** Scroll progress (0 → 1) of an element moving through the viewport. */
export function useScrollProgress<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    if (prefersReducedMotion()) return;
    let raf = 0;
    const update = () => {
      raf = 0;
      const el = ref.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const total = r.height + window.innerHeight;
      setProgress(Math.min(1, Math.max(0, (window.innerHeight - r.top) / total)));
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);
  return [ref, progress] as const;
}

/**
 * Odometer: each digit rolls through a column of numbers to its target, staggered left to right.
 * Non-digit characters (%, ×, –, s, ₫, M…) stay put. Re-rolls whenever `value` changes.
 */
export function Odometer({
  value,
  className = "",
  active,
  stagger = 70,
  duration = 1400,
}: {
  value: string;
  className?: string;
  active?: boolean; // controlled mode (e.g. sticky sections); otherwise rolls when scrolled into view
  stagger?: number;
  duration?: number;
}) {
  const [ref, inView] = useInView<HTMLSpanElement>({ threshold: 0.4 });
  // Arm one frame after mount so a freshly mounted odometer still rolls instead of jumping.
  const [armed, setArmed] = useState(false);
  useEffect(() => {
    let id = requestAnimationFrame(() => {
      id = requestAnimationFrame(() => setArmed(true));
    });
    return () => cancelAnimationFrame(id);
  }, []);
  const on = (active ?? inView) && armed;
  const chars = value.split("");
  let digitIndex = 0;
  return (
    <span ref={ref} className={`inline-flex items-baseline tnum ${className}`} aria-label={value} role="text">
      {chars.map((ch, i) => {
        if (!/[0-9]/.test(ch)) {
          return (
            <span key={i} aria-hidden="true" className="inline-block" style={{ opacity: on ? 1 : 0, transition: `opacity 500ms ease ${i * stagger}ms` }}>
              {ch === " " ? " " : ch}
            </span>
          );
        }
        const d = Number(ch);
        const delay = digitIndex++ * stagger;
        // Two full cycles above the target so every digit visibly spins.
        const offset = on ? 20 + d : 0;
        return (
          <span key={i} aria-hidden="true" className="relative inline-block h-[1em] overflow-hidden leading-none" style={{ verticalAlign: "-0.08em" }}>
            <span
              className="flex flex-col"
              style={{
                transform: `translateY(-${offset}em)`,
                transition: `transform ${duration}ms cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms`,
              }}
            >
              {Array.from({ length: 30 }, (_, n) => (
                <span key={n} className="block h-[1em] leading-none">
                  {n % 10}
                </span>
              ))}
            </span>
          </span>
        );
      })}
    </span>
  );
}

/** Progress (0 → 1) through a tall section whose content is position: sticky. */
export function useStickyProgress<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      const el = ref.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const travel = r.height - window.innerHeight;
      setProgress(travel > 0 ? Math.min(1, Math.max(0, -r.top / travel)) : 0);
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);
  return [ref, progress] as const;
}

/** Surface with a soft light that follows the cursor. */
export function Spotlight({ children, className = "", color = "rgba(0,136,255,0.10)" }: { children: React.ReactNode; className?: string; color?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  return (
    <div
      ref={ref}
      className={`l-spotlight ${className}`}
      style={{ "--spot": color } as React.CSSProperties}
      onPointerMove={(e) => {
        const el = ref.current;
        if (!el) return;
        const r = el.getBoundingClientRect();
        el.style.setProperty("--mx", `${e.clientX - r.left}px`);
        el.style.setProperty("--my", `${e.clientY - r.top}px`);
      }}
    >
      {children}
    </div>
  );
}

/** Card that tilts toward the cursor in 3D, with a moving sheen. */
export function TiltCard({ children, className = "", max = 7 }: { children: React.ReactNode; className?: string; max?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const reset = () => {
    const el = ref.current;
    if (!el) return;
    el.style.transform = "perspective(900px) rotateX(0deg) rotateY(0deg)";
    el.style.setProperty("--sheen", "0");
  };
  return (
    <div
      ref={ref}
      className={`l-tilt ${className}`}
      onPointerMove={(e) => {
        const el = ref.current;
        if (!el || prefersReducedMotion() || e.pointerType !== "mouse") return;
        const r = el.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - 0.5;
        const y = (e.clientY - r.top) / r.height - 0.5;
        el.style.transform = `perspective(900px) rotateX(${(-y * max).toFixed(2)}deg) rotateY(${(x * max).toFixed(2)}deg)`;
        el.style.setProperty("--sx", `${(x + 0.5) * 100}%`);
        el.style.setProperty("--sy", `${(y + 0.5) * 100}%`);
        el.style.setProperty("--sheen", "1");
      }}
      onPointerLeave={reset}
    >
      {children}
    </div>
  );
}
