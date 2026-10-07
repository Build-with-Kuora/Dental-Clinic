import type { Metadata } from "next";
import Link from "next/link";
import { Booking } from "@/components/Booking";

export const metadata: Metadata = {
  title: "Book an Appointment",
  description:
    "Request a dental appointment at Capizonda Dental Clinic in Molo, Iloilo City. Pick a service, date, and time, and we will confirm by text.",
};

export default function BookPage() {
  return (
    <main id="main">
      <section className="page-hero" aria-labelledby="book-title">
        <div className="container">
          <nav className="crumbs" aria-label="Breadcrumb">
            <Link href="/">Home</Link>
            <span aria-hidden="true">/</span>
            <span aria-current="page">Book an appointment</span>
          </nav>
          <h1 id="book-title">Book an appointment</h1>
          <p>Choose a service and a time that works for you. The clinic will text you to confirm your schedule.</p>
        </div>
      </section>
      <section className="book-section">
        <div className="container">
          <Booking />
        </div>
      </section>
    </main>
  );
}
