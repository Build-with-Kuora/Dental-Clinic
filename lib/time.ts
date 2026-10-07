// Date helpers. The clinic runs on Philippine time (UTC+8) regardless of the visitor's timezone.

export const DOW = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
export const DOW_LONG = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
export const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

/** Current wall-clock time in the Philippines, as a local Date. */
export function phNow(): Date {
  const now = new Date();
  return new Date(now.getTime() + now.getTimezoneOffset() * 60000 + 8 * 3600000);
}

const pad = (n: number) => (n < 10 ? "0" : "") + n;

export function iso(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function parseIso(s: string): Date {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, m - 1, d);
}

/** "13:30" -> "1:30 PM" */
export function fmtTime(t: string): string {
  const h = Number(t.slice(0, 2));
  return `${((h + 11) % 12) + 1}:${t.slice(3)} ${h < 12 ? "AM" : "PM"}`;
}

/** "2026-10-10" -> "Sat, Oct 10" or "Saturday, October 10" */
export function fmtDate(s: string, long = false): string {
  const d = parseIso(s);
  const month = MONTHS[d.getMonth()];
  return `${long ? DOW_LONG[d.getDay()] : DOW[d.getDay()]}, ${long ? month : month.slice(0, 3)} ${d.getDate()}`;
}
