"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowRight, Check, CloudSun, DatabaseZap, GitMerge, MessageSquareText, ShieldCheck, Sparkles, Volume2, VolumeX, Workflow } from "lucide-react";
import { DOMAINS, FEATURES, PIPELINE } from "./content";
import { MaskHeading, Reveal, prefersReducedMotion, useStickyProgress } from "./motion";
import { MacBookPro } from "./Devices";
import Slider from "./Slider";
import { STACK_ICONS, type StackIcon } from "./stackIcons";

export function Intro() {
  return (
    <section id="product" className="l-section bg-white">
      <div className="l-container">
        <div className="mx-auto max-w-[900px] text-center">
          <Reveal>
            <p className="l-eyebrow">Introducing Weatherise</p>
          </Reveal>
          <MaskHeading className="l-display mt-4" lines={[<span key="a" className="l-gradient-text">Forecasts in.</span>, "Decisions out."]} />
          <Reveal delay={220}>
            <p className="l-sub mx-auto mt-6 max-w-[680px]">
              Weatherise is an enterprise multi-agent AI system that helps teams analyze, predict, and act on weather risk in their own domain. Specialized
              agents understand the context, gather the right data, weigh the forecast against real safety rules, and hand back a plan you can act on.
            </p>
          </Reveal>
        </div>

        <ul className="mt-16 grid gap-5 md:grid-cols-3">
          {DOMAINS.map((d, i) => (
            <Reveal as="li" key={d.key} delay={i * 120}>
              <a href={d.href} className="l-card group flex h-full flex-col p-7 transition-transform duration-300 hover:-translate-y-1 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[color:var(--l-blue)]">
                <span className="h-1 w-10 rounded-full" style={{ background: d.color }} aria-hidden="true" />
                <h3 className="l-heading-sm mt-5">{d.name}</h3>
                <p className="l-body mt-2 flex-1">{d.line}</p>
                <span className="mt-6 inline-flex w-fit items-center gap-2 rounded-full bg-[color:var(--l-snow)] px-3.5 py-1.5 text-[14px] font-medium text-[color:var(--l-ink)] tnum">
                  <span className="h-1.5 w-1.5 rounded-full" style={{ background: d.color }} aria-hidden="true" />
                  {d.answer}
                </span>
                <span className="mt-5 inline-flex items-center gap-1.5 text-[15px] font-semibold text-[color:var(--l-blue)]">
                  See the Answer <ArrowRight size={15} aria-hidden="true" className="transition-transform duration-300 group-hover:translate-x-1" />
                </span>
              </a>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}

const UNMUTE_EVENT = "weatherise:unmute";

/** One product-tour slide: the reel plays inside a MacBook; when it ends, the slider moves on. */
function FeatureSlide({
  feature,
  active,
  onEnded,
}: {
  feature: (typeof FEATURES)[number];
  active: boolean;
  onEnded: () => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [muted, setMuted] = useState(true);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    if (active && !prefersReducedMotion()) {
      v.currentTime = 0;
      v.play().catch(() => {});
    } else {
      v.pause();
    }
  }, [active]);

  // Only one reel plays with sound at a time.
  useEffect(() => {
    const onOther = (e: Event) => {
      if ((e as CustomEvent).detail !== feature.video && videoRef.current) {
        videoRef.current.muted = true;
        setMuted(true);
      }
    };
    window.addEventListener(UNMUTE_EVENT, onOther);
    return () => window.removeEventListener(UNMUTE_EVENT, onOther);
  }, [feature.video]);

  const toggleSound = (e: React.MouseEvent) => {
    e.stopPropagation();
    const v = videoRef.current;
    if (!v) return;
    v.muted = !v.muted;
    setMuted(v.muted);
    if (!v.muted) {
      window.dispatchEvent(new CustomEvent(UNMUTE_EVENT, { detail: feature.video }));
      v.play().catch(() => {});
    }
  };

  return (
    <article className="relative flex h-full flex-col">
      <div className="mx-auto w-full max-w-[860px] px-[5%] pt-10 md:px-0 md:pt-14">
        <MacBookPro>
          {failed ? (
            <img src={feature.poster} alt={feature.title} className="absolute inset-0 h-full w-full object-cover" />
          ) : (
            <video
              ref={videoRef}
              className="absolute inset-0 h-full w-full object-cover"
              src={feature.video}
              poster={feature.poster}
              muted
              playsInline
              preload="metadata"
              aria-label={`${feature.title}: product demo`}
              onEnded={() => active && onEnded()}
              onError={() => setFailed(true)}
            />
          )}
        </MacBookPro>
      </div>
      <div className="mx-auto max-w-[760px] px-6 pb-12 pt-4 text-center md:pb-14">
        <h3 className="l-slide-title">{feature.title}</h3>
        <p className="l-slide-sub mt-3">{feature.body}</p>
      </div>
      {!failed && active && (
        <button
          type="button"
          onClick={toggleSound}
          aria-label={muted ? `Turn Sound On for ${feature.title}` : `Turn Sound Off for ${feature.title}`}
          className="l-arrow absolute right-5 top-5 !h-10 !w-auto gap-1.5 px-3.5 text-[14px] font-medium md:right-7 md:top-7"
        >
          {muted ? <VolumeX size={16} aria-hidden="true" /> : <Volume2 size={16} aria-hidden="true" />}
          {muted ? "Sound On" : "Sound Off"}
        </button>
      )}
    </article>
  );
}

export function Features() {
  const [index, setIndex] = useState(0);
  return (
    <section className="l-section l-snow" aria-labelledby="features-heading">
      <div className="l-container text-center">
        <MaskHeading id="features-heading" className="l-heading-lg" lines={["See it work."]} />
        <Reveal delay={150}>
          <p className="l-hero-sub mx-auto mt-4 max-w-[620px]">Four capabilities, one answer. Turn the sound on for the full tour.</p>
        </Reveal>
      </div>
      <Reveal delay={150} className="mt-12 md:mt-16">
        <Slider
          count={FEATURES.length}
          label="Product tour"
          index={index}
          onIndexChange={setIndex}
          render={(i, active) => <FeatureSlide feature={FEATURES[i]} active={active} onEnded={() => setIndex((i + 1) % FEATURES.length)} />}
        />
      </Reveal>
    </section>
  );
}

const STEP_ICONS = [MessageSquareText, Workflow, DatabaseZap, CloudSun, GitMerge, ShieldCheck, Sparkles];

function StackRow({ icons, reverse = false }: { icons: StackIcon[]; reverse?: boolean }) {
  const items = [...icons, ...icons];
  return (
    <div className="l-marquee-plain overflow-hidden py-3">
      <ul className={`l-marquee-track gap-4 ${reverse ? "l-marquee-rev" : ""}`} style={{ animationDuration: "46s" }}>
        {items.map((t, i) => (
          <li
            key={`${t.slug}-${i}`}
            aria-hidden={i >= icons.length}
            className="flex shrink-0 items-center gap-3 rounded-2xl bg-white px-5 py-3.5 shadow-[var(--l-shadow)] transition-transform duration-300 hover:-translate-y-1"
          >
            <svg viewBox="0 0 24 24" width="26" height="26" aria-hidden="true">
              <path d={t.path} fill={t.hex} />
            </svg>
            <span className="text-[15px] font-medium text-[color:var(--l-ink)]" translate="no">
              {t.name}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function HowItWorks() {
  const [ref, progress] = useStickyProgress<HTMLDivElement>();
  const n = PIPELINE.length;
  // Hold briefly at both ends so the first and last steps get their moment.
  const t = Math.min(1, Math.max(0, (progress - 0.06) / 0.84));
  const idx = Math.min(n - 1, Math.round(t * (n - 1)));
  const step = PIPELINE[idx];
  const half = Math.ceil(STACK_ICONS.length / 2);

  return (
    <section className="bg-white" aria-labelledby="how-heading">
      {/* Desktop: pinned stage, scroll drives the data packet */}
      <div ref={ref} className="relative hidden lg:block" style={{ height: "300vh" }}>
        <div className="sticky top-0 flex h-screen flex-col justify-center">
          <div className="l-container">
            <div className="mx-auto max-w-[760px] text-center">
              <p className="l-eyebrow">How It Works</p>
              <MaskHeading id="how-heading" className="l-heading-lg mt-3" lines={["From question to decision,", "in one pipeline."]} />
            </div>

            <div className="relative mt-16 h-[120px]">
              <div aria-hidden="true" className="absolute left-7 right-7 top-[27px] h-[2px] rounded-full bg-[color:var(--l-mist)]" />
              <div
                aria-hidden="true"
                className="absolute left-7 right-7 top-[27px] h-[2px] origin-left rounded-full"
                style={{ background: "var(--l-brand)", transform: `scaleX(${t})` }}
              />
              {/* the packet */}
              <div aria-hidden="true" className="absolute top-[28px] z-20" style={{ left: `calc(28px + (100% - 56px) * ${t})` }}>
                <span className="absolute -left-[60px] -top-[1px] h-[2px] w-[60px] rounded-full bg-gradient-to-r from-transparent to-[#0088ff]" />
                <span className="absolute -left-[7px] -top-[7px] h-[14px] w-[14px] rounded-full bg-white shadow-[0_0_0_3px_#0088ff,0_0_22px_6px_rgba(0,136,255,0.45)]" />
              </div>
              <ol className="absolute inset-0">
                {PIPELINE.map((s, i) => {
                  const Icon = STEP_ICONS[i];
                  const reached = i <= idx;
                  const current = i === idx;
                  return (
                    <li key={s.name} className="absolute top-0 flex -translate-x-1/2 flex-col items-center" style={{ left: `calc(28px + (100% - 56px) * ${i / (n - 1)})` }}>
                      <span className="relative flex h-14 w-14 items-center justify-center">
                        {current && <span className="l-ping absolute inset-0 rounded-full bg-[rgba(0,136,255,0.25)]" aria-hidden="true" />}
                        <span
                          className="relative flex h-14 w-14 items-center justify-center rounded-full bg-white shadow-[var(--l-shadow)] transition-[transform,color,box-shadow] duration-500"
                          style={{
                            color: reached ? "#0088ff" : "#ababb0",
                            transform: current ? "scale(1.12)" : "scale(1)",
                            boxShadow: current ? "0 0 0 2px #0088ff, 0 10px 30px rgba(0,136,255,0.25)" : undefined,
                          }}
                        >
                          <Icon size={22} strokeWidth={1.75} aria-hidden="true" />
                        </span>
                      </span>
                      <span className={`mt-4 whitespace-nowrap text-[15px] transition-colors duration-300 ${reached ? "font-semibold text-[color:var(--l-ink)]" : "text-[color:var(--l-pewter)]"}`}>
                        {s.name}
                      </span>
                    </li>
                  );
                })}
              </ol>
            </div>

            <div className="mt-12 grid items-start gap-10 lg:grid-cols-[1fr_1.1fr]">
              <div key={`d-${idx}`} className="r-fade-in">
                <div className="text-[64px] font-bold leading-none tracking-[-0.03em] text-[color:var(--l-mist)] tnum">0{idx + 1}</div>
                <h3 className="l-heading mt-2">{step.name}</h3>
                <p className="l-sub mt-3 max-w-[460px]">{step.detail}</p>
              </div>
              <div className="rounded-[24px] bg-[#101010] p-7 text-white shadow-[var(--l-shadow)]">
                <div className="flex items-center justify-between text-[13px] text-[#8e8e93]">
                  <span>Output · step {idx + 1} of {n}</span>
                  <span className="flex gap-1.5" aria-hidden="true">
                    {PIPELINE.map((_, i) => (
                      <span key={i} className="h-1.5 w-5 rounded-full transition-colors duration-300" style={{ background: i <= idx ? "#34c759" : "#2c2c2e" }} />
                    ))}
                  </span>
                </div>
                <p key={`p-${idx}`} className="r-fade-in mt-5 min-h-[56px] font-mono text-[16px] leading-relaxed text-[#e5e5ea]">
                  {step.payload}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile / tablet: vertical steps */}
      <div className="l-container l-section lg:hidden">
        <div className="mx-auto max-w-[760px] text-center">
          <p className="l-eyebrow">How It Works</p>
          <MaskHeading className="l-heading-lg mt-3" lines={["From question to decision,", "in one pipeline."]} />
        </div>
        <ol className="relative mt-12 space-y-8 border-l-2 border-[color:var(--l-mist)] pl-8">
          {PIPELINE.map((s, i) => {
            const Icon = STEP_ICONS[i];
            return (
              <Reveal as="li" key={s.name} delay={i * 60} className="relative">
                <span className="absolute -left-[53px] top-0 flex h-10 w-10 items-center justify-center rounded-full bg-white text-[color:var(--l-blue)] shadow-[var(--l-shadow)]">
                  <Icon size={18} aria-hidden="true" />
                </span>
                <h3 className="text-[18px] font-semibold">{s.name}</h3>
                <p className="l-body mt-1">{s.detail}</p>
                <p className="mt-2 rounded-xl bg-[#101010] px-4 py-3 font-mono text-[13px] text-[#e5e5ea]">{s.payload}</p>
              </Reveal>
            );
          })}
        </ol>
      </div>

      {/* Stack */}
      <div className="pb-[clamp(80px,11vw,120px)] pt-10 lg:pt-0">
        <p className="l-eyebrow text-center">Built With</p>
        <div className="mt-6 space-y-2">
          <StackRow icons={STACK_ICONS.slice(0, half)} />
          <StackRow icons={STACK_ICONS.slice(half)} reverse />
        </div>
      </div>
    </section>
  );
}
