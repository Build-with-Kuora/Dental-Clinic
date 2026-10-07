import type { ReactNode } from "react";

export type ServiceId =
  | "checkup" | "cleaning" | "restoration" | "extraction"
  | "dentures" | "whitening" | "braces" | "kids";

export interface Service {
  id: ServiceId;
  name: string;
  /** Local (Hiligaynon/Filipino) name patients often use */
  local?: string;
  /** Estimated chair time in minutes */
  dur: number;
  desc: string;
}

// Confirm this list and the durations with the clinic before going live.
export const SERVICES: Service[] = [
  { id: "checkup", name: "Check-up & Consultation", dur: 30,
    desc: "Complete oral exam using our intraoral camera, so you see what we see." },
  { id: "cleaning", name: "Oral Prophylaxis", local: "Cleaning", dur: 45,
    desc: "Removes plaque and tartar to keep teeth and gums healthy." },
  { id: "restoration", name: "Tooth Restoration", local: "Pasta", dur: 45,
    desc: "Tooth-colored fillings that repair cavities, chips, and cracks." },
  { id: "extraction", name: "Tooth Extraction", local: "Bunot", dur: 45,
    desc: "Gentle, careful removal when a tooth can no longer be saved." },
  { id: "dentures", name: "Dentures", local: "Pustiso", dur: 30,
    desc: "Partial or complete dentures, fitted for comfort and a natural look." },
  { id: "whitening", name: "Teeth Whitening", dur: 60,
    desc: "Brighten your smile safely, guided by your dentist." },
  { id: "braces", name: "Orthodontic Braces", dur: 30,
    desc: "Straighten teeth and correct your bite. Starts with a consultation." },
  { id: "kids", name: "Kids' Dental Care", dur: 30,
    desc: "Fluoride, sealants, and friendly first visits for little smiles." },
];

export function getService(id: string | null | undefined): Service | undefined {
  return SERVICES.find((s) => s.id === id);
}

const TOOTH = (
  <path d="M8 3C5.2 3 4 5.3 4 7.5c0 2.2.9 3.6 1.3 5.6.5 2.6.6 7.9 2.5 7.9 1.6 0 1.4-4.6 2.6-5.9.9-1 2.3-1 3.2 0 1.2 1.3 1 5.9 2.6 5.9 1.9 0 2-5.3 2.5-7.9.4-2 1.3-3.4 1.3-5.6C20 5.3 18.8 3 16 3c-1.6 0-2.6.8-4 .8S9.6 3 8 3z" />
);

const ICONS: Record<ServiceId, ReactNode> = {
  checkup: (<><circle cx="14.5" cy="9.5" r="5.5" /><path d="M10.5 13.5L3.5 20.5" /></>),
  cleaning: (<><path d="M11 3l1.8 4.7 4.7 1.8-4.7 1.8L11 16l-1.8-4.7L4.5 9.5l4.7-1.8z" /><path d="M18.5 14.5l.8 2 2 .8-2 .8-.8 2-.8-2-2-.8 2-.8z" /></>),
  restoration: (<>{TOOTH}<circle cx="12" cy="8.5" r="1.6" /></>),
  extraction: TOOTH,
  dentures: (<><path d="M3 9c2 7.5 16 7.5 18 0z" /><path d="M8 9.5v3.2M12 9.5v4M16 9.5v3.2" /></>),
  whitening: (<><circle cx="12" cy="12" r="4" /><path d="M12 2v2.5M12 19.5V22M2 12h2.5M19.5 12H22M4.9 4.9l1.8 1.8M17.3 17.3l1.8 1.8M4.9 19.1l1.8-1.8M17.3 6.7l1.8-1.8" /></>),
  braces: (<><rect x="3.5" y="8.5" width="4.5" height="7" rx="1.2" /><rect x="9.75" y="8.5" width="4.5" height="7" rx="1.2" /><rect x="16" y="8.5" width="4.5" height="7" rx="1.2" /><path d="M1.5 12h21" /></>),
  kids: (<><circle cx="12" cy="12" r="9" /><path d="M8 14s1.5 2.2 4 2.2 4-2.2 4-2.2M9 9.5h.01M15 9.5h.01" /></>),
};

export function ServiceIcon({ id }: { id: ServiceId }) {
  return (
    <span className="service-ic">
      <svg viewBox="0 0 24 24" aria-hidden="true">{ICONS[id]}</svg>
    </span>
  );
}
