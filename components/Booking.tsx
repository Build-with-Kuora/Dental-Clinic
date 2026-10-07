"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type FormEvent, type MouseEvent } from "react";
import {
  ALL_SLOTS, DAYS_AHEAD, SLOTS_AM, SLOTS_PM, downloadIcs, loadBookings, makeRef, normalizePhone,
  openCount, saveBookings, slotStatus, smsLink, type Booking as BookingRecord,
} from "@/lib/bookings";
import { CLINIC } from "@/lib/clinic";
import { SERVICES, ServiceIcon, getService } from "@/lib/services";
import { DOW, MONTHS, fmtDate, fmtTime, iso, parseIso, phNow } from "@/lib/time";
import { CalendarPlusIcon, ChevronLeft, ChevronRight, InfoIcon, MessageIcon } from "./icons";
import { useSite } from "./SiteProvider";

type Step = 1 | 2 | 3;
type Field = "name" | "phone" | "email" | "consent";

const STEP_LABELS = ["Service", "Schedule", "Your details"] as const;

const EMPTY_FORM = { name: "", phone: "", email: "", ptype: "New patient", notes: "", consent: false };

export function Booking() {
  const { toast } = useSite();

  const [now, setNow] = useState<Date | null>(null); // set after mount: dates depend on the visitor's clock
  const [bookings, setBookings] = useState<BookingRecord[]>([]);
  const [step, setStep] = useState<Step>(1);
  const [service, setService] = useState<string | null>(null);
  const [date, setDate] = useState<string | null>(null);
  const [time, setTime] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState<Partial<Record<Field, boolean>>>({});
  const [done, setDone] = useState<BookingRecord | null>(null);
  const [confirmCancel, setConfirmCancel] = useState<string | null>(null);
  const [stripEdge, setStripEdge] = useState({ start: true, end: false });
  const [showAllDates, setShowAllDates] = useState(false);

  const mainRef = useRef<HTMLDivElement>(null);
  const stripRef = useRef<HTMLDivElement>(null);
  const successRef = useRef<HTMLDivElement>(null);
  const advanceTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const scrollOnStep = useRef(false);

  useEffect(() => {
    setNow(phNow());
    setBookings(loadBookings());
    // "Book this" links arrive as /book?service=<id>: preselect it and go straight to the schedule
    const picked = getService(new URLSearchParams(window.location.search).get("service"));
    if (picked) {
      setService(picked.id);
      setStep(2);
    }
  }, []);

  const svc = getService(service);

  const days = useMemo(() => {
    if (!now) return [];
    const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    return Array.from({ length: DAYS_AHEAD }, (_, i) => {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      const key = iso(d);
      const open = openCount(key, bookings, now);
      const isSun = d.getDay() === 0;
      const tag = open === 0 ? (i === 0 ? "Closed" : "Full") : isSun ? "By appt." : `${open} open`;
      return { key, d, i, open, isSun, tag };
    });
  }, [now, bookings]);

  // Start the strip at the first bookable day, and show a week unless the visitor asks for more
  const firstOpen = Math.max(0, days.findIndex((d) => d.open > 0));
  const visibleDays = showAllDates ? days.slice(firstOpen) : days.slice(firstOpen, firstOpen + 7);

  const pickNextAvailable = () => {
    if (!now) return;
    for (const d of days) {
      if (d.isSun || d.open === 0) continue;
      const slot = ALL_SLOTS.find((sl) => slotStatus(d.key, sl, bookings, now) === "open");
      if (slot) {
        setDate(d.key);
        setTime(slot);
        return;
      }
    }
  };

  const scrollToMain = () => {
    const main = mainRef.current;
    if (!main) return;
    const top = main.getBoundingClientRect().top;
    if (top < 60 || top > window.innerHeight * 0.6) {
      window.scrollTo({ top: window.scrollY + top - 90, behavior: "smooth" });
    }
  };

  const goTo = useCallback((n: Step) => {
    scrollOnStep.current = true;
    setStep(n);
  }, []);

  useEffect(() => {
    if (step === 2) requestAnimationFrame(syncStrip);
    if (!scrollOnStep.current) return;
    scrollOnStep.current = false;
    scrollToMain();
  }, [step]);

  const resetFlow = useCallback(() => {
    setService(null);
    setDate(null);
    setTime(null);
    setForm(EMPTY_FORM);
    setErrors({});
    setDone(null);
    setNow(phNow());
    setStep(1);
  }, []);

  useEffect(() => {
    if (done) {
      successRef.current?.focus({ preventScroll: true });
      const top = mainRef.current?.getBoundingClientRect().top ?? 0;
      window.scrollTo({ top: window.scrollY + top - 90, behavior: "smooth" });
    }
  }, [done]);

  const pickService = (id: string) => {
    setService(id);
    clearTimeout(advanceTimer.current);
  };

  // Tap or click moves on after a beat; keyboard and screen-reader users press Continue themselves
  const advanceFromService = (e: MouseEvent<HTMLInputElement>) => {
    if (e.detail === 0) return;
    clearTimeout(advanceTimer.current);
    advanceTimer.current = setTimeout(() => goTo(2), 280);
  };

  const pickDate = (key: string) => {
    setDate(key);
    if (time && now && slotStatus(key, time, bookings, now) !== "open") setTime(null);
  };

  function syncStrip() {
    const s = stripRef.current;
    if (!s) return;
    setStripEdge({ start: s.scrollLeft < 4, end: s.scrollLeft + s.clientWidth >= s.scrollWidth - 4 });
  }

  const nudgeStrip = (dir: 1 | -1) => {
    const s = stripRef.current;
    if (s) s.scrollBy({ left: dir * s.clientWidth * 0.8, behavior: "smooth" });
  };

  const stepValid = step === 1 ? !!service : step === 2 ? !!(date && time) : true;

  const validate = () => {
    const phone = normalizePhone(form.phone);
    const email = form.email.trim();
    const errs: Partial<Record<Field, boolean>> = {
      name: form.name.trim().length < 2,
      phone: !/^09\d{9}$/.test(phone),
      email: email !== "" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email),
      consent: !form.consent,
    };
    setErrors(errs);
    const first = (["name", "phone", "email", "consent"] as const).find((f) => errs[f]);
    if (first) document.querySelector<HTMLInputElement>(`#booking-form [name="${first}"]`)?.focus();
    return !Object.values(errs).some(Boolean);
  };

  const submit = () => {
    if (!svc || !date || !time || !validate()) return;
    const record: BookingRecord = {
      ref: makeRef(),
      service: svc.id,
      serviceName: svc.name,
      dur: svc.dur,
      date,
      time,
      name: form.name.trim(),
      phone: normalizePhone(form.phone),
      email: form.email.trim(),
      type: form.ptype,
      notes: form.notes.trim(),
      created: new Date().toISOString(),
    };
    const list = [...loadBookings(), record];
    saveBookings(list);
    setBookings(list);
    setDone(record);
  };

  const onNext = () => {
    if (step < 3) {
      if (stepValid) goTo((step + 1) as Step);
    } else submit();
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (step === 3) submit();
  };

  const setField = <K extends keyof typeof EMPTY_FORM>(k: K, v: (typeof EMPTY_FORM)[K]) => {
    setForm((f) => ({ ...f, [k]: v }));
    if (k in errors) setErrors((e) => ({ ...e, [k]: false }));
  };

  const cancelBooking = (ref: string) => {
    if (confirmCancel !== ref) {
      setConfirmCancel(ref);
      setTimeout(() => setConfirmCancel((c) => (c === ref ? null : c)), 3000);
      return;
    }
    const list = loadBookings().filter((b) => b.ref !== ref);
    saveBookings(list);
    setBookings(list);
    setConfirmCancel(null);
    toast(`Request ${ref} cancelled.`);
  };

  const today = now ? iso(now) : "";
  const upcoming = bookings
    .filter((b) => b.date >= today)
    .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));

  const monthRef = date ? parseIso(date) : now;
  const isSunday = date ? parseIso(date).getDay() === 0 : false;

  const renderSlots = (list: string[]) =>
    list.map((s) => {
      const st = date && now ? slotStatus(date, s, bookings, now) : "open";
      const suffix = st === "taken" ? ", already booked" : st === "past" ? ", unavailable" : "";
      return (
        <button
          key={s}
          type="button"
          className="slot"
          aria-pressed={time === s}
          disabled={st !== "open"}
          aria-label={fmtTime(s) + suffix}
          onClick={() => setTime(s)}
        >
          {fmtTime(s)}
        </button>
      );
    });

  return (
    <>
        <div className="booking">
          <div className="booking-main" ref={mainRef}>
            {!done && (
              <>
                <p className="step-now" aria-live="polite">Step {step} of 3: {STEP_LABELS[step - 1]}</p>
                <ol className="stepper" aria-label="Booking steps">
                  {STEP_LABELS.map((label, i) => {
                    const n = i + 1;
                    const cls = n === step ? "is-active" : n < step ? "is-done" : undefined;
                    return (
                      <li key={label} className={cls}>
                        <span>{n}</span><em>{label}</em>
                      </li>
                    );
                  })}
                </ol>

                <form id="booking-form" noValidate onSubmit={onSubmit}>
                  {step === 1 && (
                    <fieldset className="step is-active">
                      <legend className="step-title">What do you need help with?</legend>
                      <div className="service-options">
                        {SERVICES.map((s) => (
                          <label className="opt" key={s.id}>
                            <input
                              type="radio"
                              name="service"
                              value={s.id}
                              checked={service === s.id}
                              onChange={() => pickService(s.id)}
                              onClick={advanceFromService}
                            />
                            <ServiceIcon id={s.id} />
                            <span className="opt-body">
                              <span className="opt-name">{s.name}</span>
                              <span className="opt-dur">{s.local ? `${s.local} · ` : ""}approx. {s.dur} min</span>
                            </span>
                            <span className="opt-check">
                              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12l5 5 9-10" /></svg>
                            </span>
                          </label>
                        ))}
                      </div>
                    </fieldset>
                  )}

                  {step === 2 && (
                    <fieldset className="step is-active">
                      <legend className="step-title">Choose a date and time</legend>
                      <div className="date-head">
                        <span id="month-label">{monthRef ? `${MONTHS[monthRef.getMonth()]} ${monthRef.getFullYear()}` : ""}</span>
                        <div className="date-nav">
                          <button type="button" className="icon-btn" aria-label="Earlier dates" disabled={stripEdge.start} onClick={() => nudgeStrip(-1)}>
                            <ChevronLeft />
                          </button>
                          <button type="button" className="icon-btn" aria-label="Later dates" disabled={stripEdge.end} onClick={() => nudgeStrip(1)}>
                            <ChevronRight />
                          </button>
                        </div>
                      </div>
                      <div className="date-strip" ref={stripRef} role="group" aria-label="Available dates" onScroll={syncStrip}>
                        {visibleDays.map((d) => (
                          <button
                            key={d.key}
                            type="button"
                            className={`date-chip${d.open === 0 ? " is-full" : d.isSun ? " is-sunday" : ""}`}
                            aria-pressed={date === d.key}
                            disabled={d.open === 0}
                            aria-label={`${fmtDate(d.key, true)}, ${d.tag}`}
                            onClick={() => pickDate(d.key)}
                          >
                            <span className="dw">{d.i === 0 ? "Today" : DOW[d.d.getDay()]}</span>
                            <span className="dn">{d.d.getDate()}</span>
                            <span className="dt">{d.tag}</span>
                          </button>
                        ))}
                      </div>
                      <div className="date-tools">
                        <button type="button" className="btn-chip" onClick={pickNextAvailable}>Pick the next available time</button>
                        {days.length > visibleDays.length + firstOpen && (
                          <button type="button" className="btn-chip" onClick={() => setShowAllDates(true)}>Show more dates</button>
                        )}
                      </div>
                      {isSunday && (
                        <p className="sunday-note">
                          <InfoIcon />
                          Sundays are by appointment only. Send a request and we will confirm if the doctor is available.
                        </p>
                      )}
                      <div className="slot-group">
                        {date ? (
                          <>
                            <p className="slot-label">Morning</p>
                            <div className="slots">{renderSlots(SLOTS_AM)}</div>
                            <p className="slot-label">Afternoon</p>
                            <div className="slots">{renderSlots(SLOTS_PM)}</div>
                          </>
                        ) : (
                          <div className="slots"><p className="slots-empty">Pick a date above to see available times.</p></div>
                        )}
                      </div>
                    </fieldset>
                  )}

                  {step === 3 && (
                    <fieldset className="step is-active">
                      <legend className="step-title">Tell us about you</legend>
                      <dl className="review">
                        <div><dt>Service</dt><dd>{svc?.name}</dd></div>
                        <div><dt>When</dt><dd>{date && time ? `${fmtDate(date)} · ${fmtTime(time)}` : ""}</dd></div>
                      </dl>
                      <div className="field-grid">
                        <label className={`field${errors.name ? " has-error" : ""}`}>
                          <span>Full name</span>
                          <input type="text" name="name" autoComplete="name" aria-invalid={!!errors.name} aria-describedby="err-name" placeholder="Juan Dela Cruz" required
                            value={form.name} onChange={(e) => setField("name", e.target.value)} />
                          <small id="err-name" className="err" role="alert">Please enter your name.</small>
                        </label>
                        <label className={`field${errors.phone ? " has-error" : ""}`}>
                          <span>Mobile number</span>
                          <input type="tel" name="phone" autoComplete="tel" aria-invalid={!!errors.phone} aria-describedby="err-phone" inputMode="tel" placeholder="0917 123 4567" required
                            value={form.phone} onChange={(e) => setField("phone", e.target.value)} />
                          <small id="err-phone" className="err" role="alert">Enter a valid PH mobile number, like 0917 123 4567.</small>
                        </label>
                        <label className={`field${errors.email ? " has-error" : ""}`}>
                          <span>Email <i>(optional)</i></span>
                          <input type="email" name="email" autoComplete="email" aria-invalid={!!errors.email} aria-describedby="err-email" placeholder="you@email.com"
                            value={form.email} onChange={(e) => setField("email", e.target.value)} />
                          <small id="err-email" className="err" role="alert">That email doesn&apos;t look right.</small>
                        </label>
                        <div className="field">
                          <span>Patient type</span>
                          <div className="seg" role="radiogroup" aria-label="Patient type">
                            {(["New patient", "Returning patient"] as const).map((v) => (
                              <label key={v}>
                                <input type="radio" name="ptype" value={v} checked={form.ptype === v}
                                  onChange={() => setField("ptype", v)} />
                                <span>{v.split(" ")[0]}</span>
                              </label>
                            ))}
                          </div>
                        </div>
                        <label className="field field-full">
                          <span>Anything we should know? <i>(optional)</i></span>
                          <textarea name="notes" rows={3} placeholder="e.g. tooth pain on the lower left, sensitive to cold"
                            value={form.notes} onChange={(e) => setField("notes", e.target.value)} />
                        </label>
                        <label className="check field-full">
                          <input type="checkbox" name="consent" required aria-invalid={!!errors.consent} aria-describedby="err-consent" checked={form.consent}
                            onChange={(e) => setField("consent", e.target.checked)} />
                          <span>I understand this is a booking request. The clinic will confirm my schedule by text or call.</span>
                        </label>
                        {errors.consent && <small id="err-consent" className="err is-shown field-full" role="alert">Please tick the box to continue.</small>}
                      </div>
                    </fieldset>
                  )}

                  {!stepValid && (
                    <p className="step-hint" id="step-hint">
                      {step === 1 ? "Choose a service to continue." : "Pick a date and a time to continue."}
                    </p>
                  )}
                  <div className="step-actions">
                    {step > 1 && (
                      <button type="button" className="btn btn-outline" onClick={() => goTo((step - 1) as Step)}>Back</button>
                    )}
                    <button type="button" className="btn btn-navy" disabled={!stepValid} aria-describedby={stepValid ? undefined : "step-hint"} onClick={onNext}>
                      {step === 3 ? "Send request" : "Continue"}
                    </button>
                  </div>
                </form>
                <p className="call-line">
                  Prefer to talk to us? <a href={CLINIC.phoneTel}>Call {CLINIC.phoneDisplay}</a>
                </p>
              </>
            )}

            {done && (
              <div className="success" ref={successRef} tabIndex={-1}>
                <div className="success-badge" aria-hidden="true">
                  <svg viewBox="0 0 52 52"><circle cx="26" cy="26" r="24" /><path d="M15 27l7 7 15-16" /></svg>
                </div>
                <h3>One last step: text the clinic</h3>
                <p className="success-lead">
                  Your request <strong>{done.ref}</strong> is saved on this device only. Tap the button below to send it to the clinic.
                </p>
                <div className="success-card">
                  <div><span>Service</span><strong>{done.serviceName}</strong></div>
                  <div><span>Date</span><strong>{fmtDate(done.date, true)}</strong></div>
                  <div><span>Time</span><strong>{fmtTime(done.time)}</strong></div>
                  <div><span>Patient</span><strong>{done.name} ({done.type})</strong></div>
                </div>
                <ol className="next-steps">
                  <li>Send the pre-filled text to the clinic.</li>
                  <li>
                    The clinic replies to <strong>{done.phone.replace(/^(\d{4})(\d{3})(\d{4})$/, "$1 $2 $3")}</strong> to confirm
                    your schedule, Monday to Saturday, 9 AM to 5 PM.
                  </li>
                  <li>Arrive a few minutes early on the day.</li>
                </ol>
                <div className="success-actions">
                  <a className="btn btn-gold" href={smsLink(done)}>
                    <MessageIcon /> Send request by text
                  </a>
                  <button className="btn btn-outline" type="button" onClick={() => { downloadIcs(done); toast("Calendar file downloaded."); }}>
                    <CalendarPlusIcon /> Add to calendar
                  </button>
                  <button className="btn btn-link" type="button" onClick={resetFlow}>Book another</button>
                </div>
              </div>
            )}
          </div>

          <aside className="booking-summary" aria-label="Booking summary">
            <h3>Your appointment</h3>
            <dl>
              <div><dt>Service</dt><dd>{svc ? svc.name : "Not selected"}</dd></div>
              <div><dt>Date</dt><dd>{date ? fmtDate(date) : "Not selected"}</dd></div>
              <div><dt>Time</dt><dd>{time ? fmtTime(time) : "Not selected"}</dd></div>
              <div><dt>Est. duration</dt><dd>{svc ? `~${svc.dur} min` : "-"}</dd></div>
            </dl>
            <div className="summary-help">
              <p>Prefer to talk to us?</p>
              <a href={CLINIC.phoneTel}>Call {CLINIC.phoneDisplay}</a>
            </div>
          </aside>
        </div>

        {upcoming.length > 0 && (
          <div className="my-bookings">
            <h3>Your requests on this device</h3>
            <ul>
              {upcoming.map((b) => (
                <li className="mb-item" key={b.ref}>
                  <div>
                    <strong>{b.serviceName}</strong>
                    <span>{fmtDate(b.date)} · {fmtTime(b.time)} · {b.ref}</span>
                  </div>
                  <button
                    type="button"
                    className={`mb-cancel${confirmCancel === b.ref ? " is-confirm" : ""}`}
                    onClick={() => cancelBooking(b.ref)}
                  >
                    {confirmCancel === b.ref ? "Tap to confirm" : "Cancel"}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
    </>
  );
}
