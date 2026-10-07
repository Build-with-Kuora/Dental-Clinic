// Booking requests for the demo. They live in the visitor's browser only; the clinic is
// reached by the prefilled SMS on the success screen. Swap these for an API call in production.
import { CLINIC } from "./clinic";
import { fmtDate, fmtTime, iso } from "./time";

export interface Booking {
  ref: string;
  service: string;
  serviceName: string;
  dur: number;
  date: string; // yyyy-mm-dd
  time: string; // HH:mm, Philippine time
  name: string;
  phone: string;
  email: string;
  type: string;
  notes: string;
  created: string;
}

export const SLOTS_AM = ["09:00", "09:30", "10:00", "10:30", "11:00", "11:30"];
export const SLOTS_PM = ["13:00", "13:30", "14:00", "14:30", "15:00", "15:30", "16:00", "16:30"];
export const ALL_SLOTS = [...SLOTS_AM, ...SLOTS_PM];
export const DAYS_AHEAD = 21;

const STORAGE_KEY = "cdc_bookings_v1";

export function loadBookings(): Booking[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]") as Booking[];
  } catch {
    return [];
  }
}

export function saveBookings(list: Booking[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch {
    /* storage unavailable (private mode) */
  }
}

/** Deterministic "already booked" slots so the demo calendar looks lived-in. */
function seededTaken(dateIso: string, slot: string): boolean {
  const str = dateIso + slot;
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0) % 100 < 24;
}

export type SlotStatus = "open" | "taken" | "past";

export function slotStatus(dateIso: string, slot: string, bookings: Booking[], now: Date): SlotStatus {
  if (dateIso === iso(now)) {
    const mins = Number(slot.slice(0, 2)) * 60 + Number(slot.slice(3));
    if (mins <= now.getHours() * 60 + now.getMinutes() + 30) return "past";
  }
  if (bookings.some((b) => b.date === dateIso && b.time === slot) || seededTaken(dateIso, slot)) return "taken";
  return "open";
}

export function openCount(dateIso: string, bookings: Booking[], now: Date): number {
  return ALL_SLOTS.filter((s) => slotStatus(dateIso, s, bookings, now) === "open").length;
}

/** Accepts 0917..., +63917..., 63917... with spaces or dashes; returns 09XXXXXXXXX form. */
export function normalizePhone(v: string): string {
  let d = v.replace(/[^\d+]/g, "");
  if (d.startsWith("+63")) d = "0" + d.slice(3);
  else if (d.startsWith("63") && d.length === 12) d = "0" + d.slice(2);
  return d;
}

export function makeRef(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let out = "";
  for (let i = 0; i < 4; i++) out += chars[Math.floor(Math.random() * chars.length)];
  return "CDC-" + out;
}

export function smsLink(b: Booking): string {
  const body =
    `Hi ${CLINIC.name}! I'd like to book ${b.serviceName} on ${fmtDate(b.date, true)} at ${fmtTime(b.time)}. ` +
    `Name: ${b.name}. Ref: ${b.ref}.`;
  const ios =
    /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  return `sms:${CLINIC.phone}${ios ? "&" : "?"}body=${encodeURIComponent(body)}`;
}

export function downloadIcs(b: Booking): void {
  const [y, m, d] = b.date.split("-").map(Number);
  const h = Number(b.time.slice(0, 2));
  const min = Number(b.time.slice(3));
  // Clinic times are Philippine time (UTC+8)
  const start = new Date(Date.UTC(y, m - 1, d, h - 8, min));
  const end = new Date(start.getTime() + b.dur * 60000);
  const stamp = (x: Date) => x.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  const ics = [
    "BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Capizonda Dental Clinic//Booking//EN", "BEGIN:VEVENT",
    `UID:${b.ref}@capizonda-dental`, `DTSTAMP:${stamp(new Date())}`,
    `DTSTART:${stamp(start)}`, `DTEND:${stamp(end)}`,
    `SUMMARY:${b.serviceName} - ${CLINIC.name}`,
    "LOCATION:Brgy. West Habog-Habog\\, Molo\\, Iloilo City (in front of Baluarte Elementary School)",
    `DESCRIPTION:Booking ref ${b.ref}. Awaiting clinic confirmation. Call or text ${CLINIC.phoneDisplay}.`,
    "END:VEVENT", "END:VCALENDAR",
  ].join("\r\n");
  const url = URL.createObjectURL(new Blob([ics], { type: "text/calendar" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = `capizonda-${b.ref}.ics`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
