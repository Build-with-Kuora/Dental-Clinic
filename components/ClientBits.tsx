"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { CLINIC } from "@/lib/clinic";
import { phNow } from "@/lib/time";
import { PhoneIcon } from "./icons";

/** Fades in every `.reveal` element the first time it scrolls into view. */
export function RevealObserver() {
  useEffect(() => {
    const els = document.querySelectorAll<HTMLElement>(".reveal");
    const obs = new IntersectionObserver(
      (entries) =>
        entries.forEach((en) => {
          if (en.isIntersecting) {
            en.target.classList.add("is-in");
            obs.unobserve(en.target);
          }
        }),
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" },
    );
    els.forEach((el, i) => {
      el.style.transitionDelay = `${(i % 4) * 70}ms`;
      obs.observe(el);
    });
    return () => obs.disconnect();
  }, []);
  return null;
}

/** Sticky Call / Book bar on phones: shows once the visitor scrolls past the hero. */
export function MobileBar() {
  const [pastHero, setPastHero] = useState(false);

  useEffect(() => {
    const hero = document.querySelector<HTMLElement>(".hero");
    const onScroll = () => setPastHero(window.scrollY > (hero?.offsetHeight ?? 600) * 0.6);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className={`mobile-bar${pastHero ? " is-visible" : ""}`}>
      <a className="mb-call" href={CLINIC.phoneTel}><PhoneIcon /> Call</a>
      <Link className="mb-book" href="/book">Book Appointment</Link>
    </div>
  );
}

const HOURS: { day: number; label: string; hours: string }[] = [
  { day: 1, label: "Monday", hours: "9:00 AM to 5:00 PM" },
  { day: 2, label: "Tuesday", hours: "9:00 AM to 5:00 PM" },
  { day: 3, label: "Wednesday", hours: "9:00 AM to 5:00 PM" },
  { day: 4, label: "Thursday", hours: "9:00 AM to 5:00 PM" },
  { day: 5, label: "Friday", hours: "9:00 AM to 5:00 PM" },
  { day: 6, label: "Saturday", hours: "9:00 AM to 5:00 PM" },
  { day: 0, label: "Sunday", hours: "By appointment only" },
];

function openStatus(d: Date): { open: boolean; text: string } {
  const day = d.getDay();
  const mins = d.getHours() * 60 + d.getMinutes();
  const open = day !== 0 && mins >= 9 * 60 && mins < 17 * 60;
  if (open) return { open, text: "Open now, until 5:00 PM" };
  if (day === 0) return { open, text: "Sunday: by appointment only" };
  if (mins < 9 * 60) return { open, text: "Closed now, opens at 9:00 AM" };
  return { open, text: day === 6 ? "Closed now, opens Monday 9:00 AM" : "Closed now, opens tomorrow 9:00 AM" };
}

/** Clinic hours with today highlighted and a live open/closed line (Philippine time). */
export function HoursTable() {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(phNow());
    const id = setInterval(() => setNow(phNow()), 60000);
    return () => clearInterval(id);
  }, []);

  const status = now ? openStatus(now) : null;

  return (
    <>
      <table className="hours">
        <tbody>
          {HOURS.map((h) => (
            <tr key={h.day} className={now?.getDay() === h.day ? "is-today" : undefined}>
              <td>{h.label}</td>
              <td>{h.hours}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {status && <p className={`open-now ${status.open ? "is-open" : "is-closed"}`}>{status.text}</p>}
    </>
  );
}
