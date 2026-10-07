"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const LINKS = [
  { id: "dentist", label: "Our Dentist" },
  { id: "services", label: "Services" },
  { id: "technology", label: "Why Us" },
  { id: "visit", label: "Visit" },
  { id: "faq", label: "FAQ" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState("");

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    document.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("scroll", onScroll);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  // Highlight the section in view (home page only)
  useEffect(() => {
    setOpen(false);
    setActive("");
    if (pathname !== "/") return;
    const obs = new IntersectionObserver(
      (entries) => entries.forEach((en) => en.isIntersecting && setActive(en.target.id)),
      { rootMargin: "-45% 0px -50% 0px" },
    );
    LINKS.forEach((l) => {
      const el = document.getElementById(l.id);
      if (el) obs.observe(el);
    });
    return () => obs.disconnect();
  }, [pathname]);

  return (
    <header className={`site-header${scrolled ? " is-scrolled" : ""}`} id="top">
      <div className="container header-inner">
        <Link className="brand" href="/" aria-label="Capizonda Dental Clinic home">
          <img className="brand-mark" src="/assets/img/tooth-mark.png" alt="" width={345} height={420} />
          <span className="brand-text">
            <span className="brand-name">CAPIZONDA</span>
            <span className="brand-sub">DENTAL CLINIC</span>
          </span>
        </Link>

        <nav
          className={`nav${open ? " is-open" : ""}`}
          id="site-nav"
          aria-label="Main"
          onClick={(e) => { if ((e.target as HTMLElement).closest("a")) setOpen(false); }}
        >
          {LINKS.map((l) => (
            <Link key={l.id} href={`/#${l.id}`} className={active === l.id ? "is-active" : undefined}>
              {l.label}
            </Link>
          ))}
          <Link className="btn btn-gold nav-cta" href="/book" aria-current={pathname === "/book" ? "page" : undefined}>
            Book Appointment
          </Link>
        </nav>

        <button
          className="nav-toggle"
          type="button"
          aria-controls="site-nav"
          aria-expanded={open}
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((o) => !o)}
        >
          <span /><span /><span />
        </button>
      </div>
    </header>
  );
}
