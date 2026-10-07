import type { ReactNode } from "react";

function Icon({ children, className = "i" }: { children: ReactNode; className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      {children}
    </svg>
  );
}

const PHONE_PATH =
  "M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.8.7 2.7a2 2 0 0 1-.5 2.1L8 9.8a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.7.7a2 2 0 0 1 1.7 2z";

export const ArrowRight = () => <Icon><path d="M5 12h14M13 6l6 6-6 6" /></Icon>;
export const PhoneIcon = () => <Icon><path d={PHONE_PATH} /></Icon>;
export const CalendarIcon = () => (
  <Icon><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" /></Icon>
);
export const ClockIcon = () => <Icon><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></Icon>;
export const PinIcon = () => (
  <Icon><path d="M12 22s-7-6.2-7-12a7 7 0 0 1 14 0c0 5.8-7 12-7 12z" /><circle cx="12" cy="10" r="2.5" /></Icon>
);
export const InfoIcon = () => <Icon><circle cx="12" cy="12" r="9" /><path d="M12 8v5M12 16h.01" /></Icon>;
export const ChevronLeft = () => <Icon><path d="M15 6l-6 6 6 6" /></Icon>;
export const ChevronRight = () => <Icon><path d="M9 6l6 6-6 6" /></Icon>;
export const MessageIcon = () => (
  <Icon><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></Icon>
);
export const CalendarPlusIcon = () => (
  <Icon><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18M12 14v4M10 16h4" /></Icon>
);

/** Bare SVG children for the motion stage, which styles its own icons */
export { PHONE_PATH };
