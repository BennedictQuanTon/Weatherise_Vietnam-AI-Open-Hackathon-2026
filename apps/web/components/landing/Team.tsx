"use client";

import { DEVELOPERS, MENTORS } from "./content";
import { MaskHeading, Reveal, TiltCard, useInView } from "./motion";

function initials(name: string) {
  return name
    .replace(/^Mr\.\s*/, "")
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("");
}

function DeveloperCard({ name, role, photo, index }: { name: string; role: string; photo: string; index: number }) {
  const [ref, inView] = useInView<HTMLLIElement>({ threshold: 0.25 });
  const [primary, secondary] = role.split(" · ");
  return (
    <li ref={ref} className={index % 2 ? "md:mt-20" : ""}>
      <TiltCard className="group relative aspect-[3/4] overflow-hidden rounded-[28px] bg-[color:var(--l-snow)] shadow-[0_0_0_1px_rgba(16,16,16,0.07),var(--l-shadow)]">
        <div
          className="absolute inset-0 bg-[#ececef]"
          style={{
            clipPath: inView ? "inset(0 0 0 0 round 28px)" : "inset(100% 0 0 0 round 28px)",
            transition: `clip-path 1200ms cubic-bezier(0.16, 1, 0.3, 1) ${index * 120}ms`,
          }}
        >
          <img
            src={photo}
            alt={`Portrait of ${name}`}
            loading="lazy"
            className="h-full w-full object-cover object-top mix-blend-multiply transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.06]"
            style={{ transform: inView ? undefined : "scale(1.15)" }}
          />
          <div className="absolute inset-x-0 bottom-0 h-[55%] bg-gradient-to-t from-[rgba(16,16,16,0.82)] via-[rgba(16,16,16,0.35)] to-transparent" aria-hidden="true" />
        </div>
        <span className="absolute left-4 top-4 rounded-full bg-white/90 px-2.5 py-1 text-[12px] font-semibold text-[color:var(--l-ink)] shadow-[0_2px_10px_rgba(16,16,16,0.12)] backdrop-blur tnum">0{index + 1}</span>
        <div className="absolute inset-x-0 bottom-0 p-5 text-white" style={{ opacity: inView ? 1 : 0, transform: inView ? "none" : "translateY(12px)", transition: `opacity 800ms cubic-bezier(0.16,1,0.3,1) ${400 + index * 120}ms, transform 800ms cubic-bezier(0.16,1,0.3,1) ${400 + index * 120}ms` }}>
          <p className="text-[21px] font-semibold leading-tight tracking-[-0.01em]">{name}</p>
          <p className="mt-1 text-[14px] text-white/85">{primary}</p>
          {secondary && <p className="text-[14px] text-white/65">{secondary}</p>}
        </div>
        <div className="l-sheen pointer-events-none absolute inset-0" aria-hidden="true" />
      </TiltCard>
    </li>
  );
}

function MentorCard({ name, role, org, photo, index }: { name: string; role: string; org: string; photo: string | null; index: number }) {
  return (
    <Reveal as="li" delay={index * 120} className="group">
      <div className="flex items-center gap-5 md:flex-col md:items-start">
        <div className="relative h-24 w-24 shrink-0">
          <span aria-hidden="true" className="l-ring absolute -inset-[3px] rounded-full opacity-0 transition-opacity duration-500 group-hover:opacity-100" style={{ background: "conic-gradient(from 0deg, #0088ff, #34c759, #feab30, #0088ff)" }} />
          <span aria-hidden="true" className="absolute -inset-[3px] rounded-full bg-[color:var(--l-silver)] transition-opacity duration-500 group-hover:opacity-0" />
          <div className="relative h-full w-full overflow-hidden rounded-full border-[3px] border-[color:var(--l-snow)] bg-white">
            {photo ? (
              <img src={photo} alt={`Portrait of ${name.replace(/^Mr\.\s*/, "")}`} loading="lazy" className="h-full w-full object-cover object-top" />
            ) : (
              <div className="flex h-full w-full items-center justify-center" aria-hidden="true">
                <span className="l-gradient-text text-[30px] font-bold">{initials(name)}</span>
              </div>
            )}
          </div>
        </div>
        <div>
          <p className="text-[19px] font-semibold tracking-[-0.01em] text-[color:var(--l-ink)]">{name}</p>
          <p className="l-body mt-0.5 !text-[15px]">{role}</p>
          <p className="mt-1 text-[13px] font-semibold text-[#5a8f00]">
            {org}
          </p>
        </div>
      </div>
    </Reveal>
  );
}

export default function Team() {
  return (
    <section id="team" className="l-section bg-white">
      <div className="l-container">
        <div className="mx-auto max-w-[760px] text-center">
          <Reveal>
            <p className="l-eyebrow">The Team</p>
          </Reveal>
          <MaskHeading className="l-heading-lg mt-3" lines={["The people behind", <span key="b" className="l-gradient-text">Weatherise.</span>]} />
          <Reveal delay={150}>
            <p className="l-sub mt-5">Four builders from HCMUT – UTS, guided by three NVIDIA mentors.</p>
          </Reveal>
        </div>

        <ul className="mt-16 grid grid-cols-2 gap-5 md:grid-cols-4 md:gap-6">
          {DEVELOPERS.map((d, i) => (
            <DeveloperCard key={d.name} name={d.name} role={d.role} photo={d.photo} index={i} />
          ))}
        </ul>

        <Reveal className="mt-20 md:mt-28">
          <div className="grid gap-10 rounded-[36px] bg-[color:var(--l-snow)] p-8 md:grid-cols-[0.75fr_2fr] md:p-12">
            <div>
              <img src="/landing/logos/nvidia.png" alt="NVIDIA" width={110} height={92} className="h-auto w-[96px] mix-blend-multiply" />
              <h3 className="l-heading mt-6">Mentors</h3>
              <p className="l-body mt-3 max-w-[280px]">Engineers who pushed us to simplify, ship, and measure.</p>
            </div>
            <ul className="grid gap-8 sm:grid-cols-3">
              {MENTORS.map((m, i) => (
                <MentorCard key={m.name} name={m.name} role={m.role} org={m.org} photo={m.photo} index={i} />
              ))}
            </ul>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
