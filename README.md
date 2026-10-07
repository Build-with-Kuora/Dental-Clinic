# Capizonda Dental Clinic: Demo Website

This is a mobile-first Next.js (App Router) site for Capizonda Dental Clinic in Molo, Iloilo City. Both pages (`/` and `/book`) are prerendered as static HTML at build time.

## Structure

```
app/layout.tsx           Fonts (next/font), metadata, Open Graph
app/page.tsx             Home page
app/book/page.tsx        Booking page (/book, accepts ?service=<id> to preselect)
app/globals.css          All styles (brand tokens at the top)
components/Sections.tsx  Static sections: hero, services, why us, dentist, visit, FAQ, footer
components/MotionVideo.tsx  Motion graphic video (GSAP timeline, ~27s loop, 4:5 layout on phones)
components/Booking.tsx   3-step booking flow used on /book
components/ClientBits.tsx   Scroll reveals, mobile Call/Book bar, live clinic hours
components/SiteHeader.tsx   Sticky header with mobile menu
components/SiteProvider.tsx Toast messages
lib/services.tsx         Service list and icons
lib/bookings.ts          Slots, storage, SMS link, calendar file
lib/clinic.ts            Phone, address, map links
public/assets/img/       Logo layers, dentist photo, clinic photo, favicon, social share image
```

## Run locally

```
npm install
npm run dev
```

Then open http://localhost:3000

To run a production build instead, use `npm run build` and then `npm start`.

## Deploy to Vercel

1. Push this repo to GitHub.
2. On https://vercel.com/new, import the repo. Vercel detects Next.js, so leave the default settings.
3. Click Deploy.

The Open Graph image URL uses Vercel's production domain automatically (`VERCEL_PROJECT_PRODUCTION_URL`), so link previews in Messenger and Facebook show the logo.

## Demo limitations

- Booking requests are saved only in the visitor's browser (localStorage). The clinic is not notified automatically. On the success screen, the "Text the clinic now" button opens an SMS to 0962 687 6076 with the booking details already filled in. For production, replace `saveBookings` in `lib/bookings.ts` with an API route that writes to a database or sends an email.
- Some time slots show as "booked". These are simulated so the demo calendar looks realistic (`seededTaken` in `lib/bookings.ts`).
- Confirm the service list and durations with the clinic (`SERVICES` in `lib/services.tsx`).
- The dentist photo was cropped from a low-resolution poster. Replace `public/assets/img/dr-capizonda.jpg` and `dr-capizonda-head.jpg` with HD photos.
