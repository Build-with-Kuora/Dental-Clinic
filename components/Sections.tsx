import Image from "next/image";
import Link from "next/link";
import { CLINIC } from "@/lib/clinic";
import { SERVICES, ServiceIcon } from "@/lib/services";
import { HoursTable } from "./ClientBits";
import { ArrowRight, CalendarIcon, ClockIcon, PhoneIcon, PinIcon } from "./icons";
import { MotionVideo } from "./MotionVideo";

export function Hero() {
  return (
    <section className="hero" aria-labelledby="hero-title">
      <div className="hero-bg" aria-hidden="true">
        <div className="hero-glow" />
        <div className="hero-grid" />
      </div>

      <div className="container hero-inner">
        <div className="hero-copy">
          <h1 id="hero-title" className="hero-title">
            Gentle dental care,<br /><em>right here in Molo.</em>
          </h1>
          <p className="hero-lead">
            Meet Dr. Capizonda and team. Book a visit in under a minute, and we will confirm by text.
          </p>
          <div className="hero-actions">
            <Link className="btn btn-gold btn-lg" href="/book">Book Appointment <ArrowRight /></Link>
            <a className="btn btn-ghost btn-lg" href={CLINIC.phoneTel}><PhoneIcon /> {CLINIC.phoneDisplay}</a>
          </div>
          <ul className="hero-facts">
            <li><CalendarIcon /><span><strong>Mon to Sat</strong> 9:00 AM to 5:00 PM</span></li>
            <li><ClockIcon /><span><strong>Sunday</strong> by appointment only</span></li>
          </ul>
        </div>

        <MotionVideo />
      </div>
    </section>
  );
}

export function Strip() {
  return (
    <section className="strip" aria-label="What to expect on your first visit">
      <div className="container strip-inner">
        <p>
          <strong>First visit?</strong> We start with a check-up, show you what we see on screen, and explain every step before we treat.
        </p>
      </div>
    </section>
  );
}

export function Services() {
  return (
    <section className="section" id="services" aria-labelledby="services-title">
      <div className="container">
        <div className="section-head reveal">
          <h2 id="services-title" className="section-title">Care for every smile in the family.</h2>
          <p className="section-lead">From your first check-up to a brighter, straighter smile. Tap any service to book it.</p>
        </div>
        <div className="services-grid">
          {SERVICES.map((s) => (
            <article className="service-card reveal" key={s.id}>
              <ServiceIcon id={s.id} />
              <div>
                <h3>{s.name}{s.local && <> <em className="service-local">({s.local})</em></>}</h3>
                <p>{s.desc}</p>
                <div className="service-meta">
                  <span className="service-time">Approx. {s.dur} min</span>
                  <Link className="service-book" href={`/book?service=${s.id}`}>Book this <ArrowRight /></Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

const TECH = [
  ["Intraoral Camera", "A tiny camera shows your teeth on screen, so you see what we see and understand every recommendation."],
  ["Autoclave Sterilization", "Instruments are sterilized with high-pressure steam after every patient. No shortcuts."],
  ["UV Sterilization Box", "An extra layer of UV protection for tools and accessories, for more efficient and safer dental care."],
];

export function Technology() {
  return (
    <section className="section section-navy" id="technology" aria-labelledby="tech-title">
      <div className="container tech-inner">
        <div className="tech-copy reveal">
          <h2 id="tech-title" className="section-title light">We invested in technology <em>so you can relax.</em></h2>
          <p className="section-lead light">
            What sets us apart is the equipment behind every visit. Clearer diagnosis, cleaner instruments, and a more efficient appointment for you.
          </p>
          <Link className="btn btn-gold" href="/book?service=checkup">Book a check-up</Link>
        </div>
        <ol className="tech-list">
          {TECH.map(([title, body]) => (
            <li className="tech-item reveal" key={title}>
              <div><h3>{title}</h3><p>{body}</p></div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

export function Dentist() {
  return (
    <section className="section" id="dentist" aria-labelledby="dentist-title">
      <div className="container dentist-inner">
        <figure className="dentist-photo reveal">
          <Image
            src="/assets/img/dr-capizonda.jpg"
            alt="Dr. Capizonda smiling with arms crossed, wearing a green dental uniform"
            width={496}
            height={1120}
            sizes="(min-width: 900px) 400px, 100vw"
          />
          <figcaption>
            <span className="script">Dr. Capizonda</span>
            <span>Doctor of Dental Medicine</span>
          </figcaption>
        </figure>

        <div className="dentist-copy">
          <div className="reveal">
            <h2 id="dentist-title" className="section-title">Hi, I&apos;m <span className="script-inline">Dr. Capizonda.</span></h2>
            <blockquote className="dentist-quote">
              “My mission is to reduce early extractions of permanent teeth caused by poor oral hygiene.”
            </blockquote>
          </div>
          <dl className="cred-list">
            <div className="cred reveal">
              <dt>Dental school</dt>
              <dd>Doctor of Dental Medicine, <strong>Iloilo Doctor&apos;s College</strong>, Batch 2020</dd>
            </div>
            <div className="cred reveal">
              <dt>Licensed</dt>
              <dd>Passed the Dentist Licensure Exam, <strong>January 2024</strong></dd>
            </div>
            <div className="cred reveal">
              <dt>Associations</dt>
              <dd>Member of the <strong>Philippine Dental Association, Iloilo Chapter</strong></dd>
            </div>
            <div className="cred reveal">
              <dt>Community</dt>
              <dd>
                Volunteered at <strong>INCGiving: Dental Activity and School Supplies Donation</strong>, teaching 100 pupils of
                Jaro II Elementary School proper dental hygiene.
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </section>
  );
}

export function Visit() {
  return (
    <section className="section" id="visit" aria-labelledby="visit-title">
      <div className="container visit-inner">
        <div className="visit-copy reveal">
          <h2 id="visit-title" className="section-title">Find us in Molo, <em>right across Baluarte Elementary.</em></h2>
          <ul className="info-list">
            <li>
              <span className="info-ic"><PinIcon /></span>
              <div><strong>Address</strong><p>{CLINIC.address}<br />({CLINIC.landmark})</p></div>
            </li>
            <li>
              <span className="info-ic"><CalendarIcon /></span>
              <div><strong>Clinic hours</strong><HoursTable /></div>
            </li>
            <li>
              <span className="info-ic"><PhoneIcon /></span>
              <div><strong>Call or text</strong><p><a href={CLINIC.phoneTel}>{CLINIC.phoneDisplay}</a></p></div>
            </li>
          </ul>
          <div className="visit-actions">
            <a className="btn btn-navy" href={CLINIC.mapsUrl} target="_blank" rel="noopener">Get directions</a>
            <a className="btn btn-outline" href={CLINIC.phoneTel}>Call clinic</a>
          </div>
        </div>
        <div className="visit-map reveal">
          <iframe
            title="Map to Capizonda Dental Clinic near Baluarte Elementary School, Molo, Iloilo City"
            src={CLINIC.mapsEmbed}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      </div>
    </section>
  );
}

const FAQS = [
  ["Is my online booking already confirmed?",
    `Your booking is a request. The clinic will text or call you to confirm the schedule. If you need a faster answer, tap "Text the clinic now" after booking, or call ${CLINIC.phoneDisplay}.`],
  ["Do you accept walk-ins?",
    "Walk-ins are welcome Monday to Saturday when the schedule allows, but patients with appointments are prioritized. Booking ahead saves you waiting time."],
  ["Can I book on a Sunday?",
    "Sundays are by appointment only. Send a Sunday request through the booking page and we will let you know if the doctor is available."],
  ["How do you keep instruments clean?",
    "All instruments go through autoclave steam sterilization, plus a UV sterilization box for an extra layer of protection."],
  ["Do you treat kids?",
    "Yes. Early check-ups, cleaning, and fluoride help prevent the decay that leads to early extractions, which is exactly what Dr. Capizonda wants to stop."],
];

export function Faq() {
  return (
    <section className="section section-cream" id="faq" aria-labelledby="faq-title">
      <div className="container faq-inner">
        <div className="section-head reveal">
          <h2 id="faq-title" className="section-title">Good to know before your visit.</h2>
        </div>
        <div className="faq-list">
          {FAQS.map(([q, a]) => (
            <details className="reveal" key={q}>
              <summary>{q}</summary>
              <p>{a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

export function CtaBand() {
  return (
    <section className="cta-band">
      <div className="container cta-inner reveal">
        <img src="/assets/img/tooth-mark.png" alt="" className="cta-mark" width={345} height={420} loading="lazy" />
        <div>
          <h2>Ready for a healthier smile?</h2>
          <p>Book online in under a minute, or call us at {CLINIC.phoneDisplay}.</p>
        </div>
        <Link className="btn btn-gold btn-lg" href="/book">Book Appointment</Link>
      </div>
    </section>
  );
}

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="container footer-inner">
        <div className="footer-brand">
          <Image src="/assets/img/logo-full.jpg" alt="Capizonda Dental Clinic logo" width={120} height={120} />
          <p>{CLINIC.tagline}</p>
        </div>
        <div className="footer-col">
          <h4>Clinic</h4>
          <Link href="/#services">Services</Link>
          <Link href="/#technology">Why Us</Link>
          <Link href="/#dentist">Our Dentist</Link>
          <Link href="/book">Book Appointment</Link>
        </div>
        <div className="footer-col">
          <h4>Contact</h4>
          <a href={CLINIC.phoneTel}>{CLINIC.phoneDisplay}</a>
          <span>{CLINIC.address}</span>
          <span>Mon to Sat, 9 AM to 5 PM</span>
        </div>
      </div>
      <div className="container footer-bottom">
        <span>&copy; {new Date().getFullYear()} {CLINIC.name}. All rights reserved.</span>
      </div>
    </footer>
  );
}
