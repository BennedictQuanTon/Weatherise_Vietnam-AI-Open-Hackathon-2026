"use client";

import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { NAV_LINKS } from "./content";

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState<string>("");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    const sections = NAV_LINKS.map((l) => document.querySelector(l.href)).filter(Boolean) as Element[];
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setActive(`#${e.target.id}`)),
      { rootMargin: "-45% 0px -50% 0px" },
    );
    sections.forEach((s) => io.observe(s));
    return () => {
      window.removeEventListener("scroll", onScroll);
      io.disconnect();
    };
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 transition-[background-color,box-shadow] duration-300 ${
        scrolled || open ? "bg-white/85 shadow-[0_1px_0_rgba(16,16,16,0.06)] backdrop-blur-xl" : "bg-white"
      }`}
    >
      <nav className="l-container flex h-16 items-center justify-between gap-6" aria-label="Main">
        <a href="#top" className="l-link flex items-center gap-2.5">
          <img src="/favicon.svg" alt="" width={28} height={28} className="h-7 w-7" />
          <span className="text-[18px] font-semibold tracking-[-0.01em] text-[color:var(--l-black)]">Weatherise</span>
        </a>

        <ul className="hidden items-center gap-[30px] md:flex">
          {NAV_LINKS.map((l) => (
            <li key={l.href}>
              <a
                href={l.href}
                aria-current={active === l.href ? "true" : undefined}
                className={`l-link text-[16px] transition-colors duration-200 ${
                  active === l.href ? "font-medium text-[color:var(--l-black)]" : "text-[color:var(--l-smoke)] hover:text-[color:var(--l-black)]"
                }`}
              >
                {l.label}
              </a>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-2">
          <a href="/app" className="l-btn l-btn-primary !px-5 !py-2">
            Try It Out
          </a>
          <button
            type="button"
            className="l-btn h-10 w-10 md:hidden"
            aria-label={open ? "Close Menu" : "Open Menu"}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X size={20} aria-hidden="true" /> : <Menu size={20} aria-hidden="true" />}
          </button>
        </div>
      </nav>

      {open && (
        <ul className="l-container flex flex-col gap-1 pb-4 md:hidden">
          {NAV_LINKS.map((l) => (
            <li key={l.href}>
              <a href={l.href} onClick={() => setOpen(false)} className="l-link block rounded-xl px-2 py-3 text-[18px] text-[color:var(--l-ink)] hover:bg-[color:var(--l-snow)]">
                {l.label}
              </a>
            </li>
          ))}
        </ul>
      )}
    </header>
  );
}
