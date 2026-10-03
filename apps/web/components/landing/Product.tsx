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
  const StepIcon = STEP_ICONS[idx];
  const half = Math.ceil(STACK_ICONS.length / 2);
  const stops = PIPELINE.map((p, i) => `${p.color} ${(i / (n - 1)) * 100}%`).join(", ");

  const jumpTo = (i: number) => {
    const el = ref.current;
    if (!el) return;
    const travel = el.offsetHeight - window.innerHeight;
    const target = el.getBoundingClientRect().top + window.scrollY + travel * (0.06 + (0.84 * i) / (n - 1)) + 2;
    window.scrollTo({ top: target, behavior: prefersReducedMotion() ? "auto" : "smooth" });
  };

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

            {/* Flow */}
            <div className="relative mt-14 h-[112px]">
              <div aria-hidden="true" className="absolute left-7 right-7 top-[27px] h-[3px] rounded-full bg-[color:var(--l-mist)]" />
              <div
                aria-hidden="true"
                className="absolute left-7 right-7 top-[27px] h-[3px] origin-left rounded-full"
                style={{ background: `linear-gradient(90deg, ${stops})`, transform: `scaleX(${t})` }}
              />
              <div aria-hidden="true" className="absolute top-[28px] z-20" style={{ left: `calc(28px + (100% - 56px) * ${t})` }}>
                <span className="absolute -left-[7px] -top-[7px] h-[14px] w-[14px] rounded-full bg-white" style={{ boxShadow: `0 0 0 3px ${step.color}, 0 0 20px 6px ${step.color}55` }} />
              </div>
              <ol className="absolute inset-0">
                {PIPELINE.map((s, i) => {
                  const Icon = STEP_ICONS[i];
                  const reached = i <= idx;
                  const current = i === idx;
                  return (
                    <li key={s.name} className="absolute top-0 -translate-x-1/2" style={{ left: `calc(28px + (100% - 56px) * ${i / (n - 1)})` }}>
                      <button type="button" onClick={() => jumpTo(i)} className="l-link flex flex-col items-center" aria-current={current ? "step" : undefined}>
                        <span
                          className="flex h-14 w-14 items-center justify-center rounded-[18px] transition-[transform,background-color,color,box-shadow] duration-500"
                          style={{
                            background: reached ? s.color : "#fff",
                            color: reached ? "#fff" : "#ababb0",
                            transform: current ? "scale(1.14)" : "scale(1)",
                            boxShadow: current ? `0 12px 28px ${s.color}59` : reached ? "none" : "0 0 0 1px rgba(16,16,16,0.08), 0 4px 12px rgba(16,16,16,0.05)",
                          }}
                        >
                          <Icon size={24} strokeWidth={1.9} aria-hidden="true" />
                        </span>
                        <span className={`mt-4 whitespace-nowrap text-[15px] transition-colors duration-300 ${current ? "font-semibold text-[color:var(--l-ink)]" : reached ? "text-[color:var(--l-ink)]" : "text-[color:var(--l-pewter)]"}`}>
                          {s.name}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ol>
            </div>

            {/* Step detail */}
            <div className="mt-12 rounded-[32px] bg-[color:var(--l-snow)] p-3">
              <div className="grid items-stretch gap-3 lg:grid-cols-[1fr_1.15fr]">
                <div key={`d-${idx}`} className="r-fade-in flex items-start gap-5 p-7">
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[14px] text-white" style={{ background: step.color }}>
                    <StepIcon size={22} strokeWidth={1.9} aria-hidden="true" />
                  </span>
                  <div>
                    <p className="text-[14px] font-semibold tnum" style={{ color: step.color }}>
                      Step {idx + 1} of {n}
                    </p>
                    <h3 className="l-slide-title mt-1">{step.name}</h3>
                    <p className="l-slide-sub mt-3 max-w-[440px]">{step.detail}</p>
                  </div>
                </div>
                <div className="flex flex-col rounded-[24px] bg-white p-7 shadow-[0_0_0_1px_rgba(16,16,16,0.05)]">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-[14px] font-semibold text-[color:var(--l-smoke)]">Output</span>
                    <span key={`a-${idx}`} className="r-fade-in rounded-full px-3 py-1 text-[13px] font-medium" style={{ background: `${step.color}14`, color: step.color }}>
                      {step.agent}
                    </span>
                  </div>
                  <p key={`p-${idx}`} className="r-fade-in mt-5 flex-1 font-mono text-[16px] leading-relaxed text-[color:var(--l-ink)]">
                    {step.payload}
                  </p>
                  <div className="mt-6 flex gap-1.5" aria-hidden="true">
                    {PIPELINE.map((s, i) => (
                      <span key={i} className="h-1.5 flex-1 rounded-full transition-colors duration-300" style={{ background: i <= idx ? s.color : "#f0f0f0" }} />
                    ))}
                  </div>
                </div>
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
                <span className="absolute -left-[57px] top-0 flex h-11 w-11 items-center justify-center rounded-[14px] text-white" style={{ background: s.color }}>
                  <Icon size={19} aria-hidden="true" />
                </span>
                <h3 className="text-[18px] font-semibold">{s.name}</h3>
                <p className="l-body mt-1">{s.detail}</p>
                <p className="mt-3 rounded-2xl bg-[color:var(--l-snow)] px-4 py-3 font-mono text-[13px] text-[color:var(--l-ink)]">{s.payload}</p>
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
