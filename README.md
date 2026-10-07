# Capizonda Dental Clinic: Demo Website

This is a mobile-first Next.js (App Router) site for Capizonda Dental Clinic in Molo, Iloilo City. Both pages (`/` and `/book`) are prerendered as static HTML at build time.

## Structure

```
app/layout.tsx           Fonts (next/font), metadata, Open Graph
app/page.tsx             Home page
app/book/page.tsx        Booking page (/book, accepts ?service=<id> to preselect)
app/globals.css          All styles. Source of truth for branding (see Design system)
components/Sections.tsx  Static sections, in page order: hero, first-visit strip, dentist, services, why us, visit, FAQ, CTA band, footer
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

## Design system

`app/globals.css` is the single source of truth for branding. Colors, fonts, radii, shadows, motion easing and header height are CSS custom properties in the `:root` block at the top. Do not hardcode brand values in components or elsewhere in the CSS; add or change a token instead.

- **Brand:** navy (`--navy-*`) and gold (`--gold-*`), matching the clinic's logo. Use `--gold-text` for gold text on light surfaces (WCAG AA). Gold on navy uses `--gold-500` or `--gold-400`.
- **Text on navy:** `--on-dark-strong`, `--on-dark`, `--on-dark-soft`, with `--hairline-dark` for dividers.
- **Neutrals and status:** `--cream`, `--ink`, `--muted`, `--line`, `--line-strong`, `--surface-sunken`, `--disabled`, `--success`, `--danger`.
- **Type:** Montserrat (display), Plus Jakarta Sans (body), Instrument Serif (accent words), Great Vibes (script). Fonts load in `app/layout.tsx` and are exposed as `--f-*` tokens.
- **One exception:** `themeColor` in `app/layout.tsx` cannot read CSS variables. It must mirror `--navy-700`.
- **Touch targets:** interactive elements are at least 44px tall.

## Booking flow

Three steps: service, schedule, details. Behavior to keep:

- A tap or click on a service moves on automatically. Keyboard and screen-reader users press Continue.
- The schedule step starts at the first bookable day and shows a week of dates. "Show more dates" reveals the rest of the 21 days, and "Pick the next available time" selects the earliest open weekday slot.
- The final button is "Send request". Errors are linked to their fields with `aria-describedby` and announced with `role="alert"`.
- The success screen is honest about the demo: the request is saved on the device only, and the visitor must send the pre-filled text to reach the clinic. It lists what happens next.
- On phones the step label ("Step 2 of 3: Schedule") sits above the stepper, step 3 shows a review of the chosen service and time, and the side summary is desktop only.

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
- The dentist photo was cropped from a low-resolution poster and is shown as a head-and-shoulders square. Replace `public/assets/img/dr-capizonda.jpg` and `dr-capizonda-head.jpg` with HD photos. Once an HD portrait exists, put it in the hero in place of the intro video.
- The intro video (`MotionVideo`) is still in the hero. Consider moving it below the dentist section or replacing it with a still.
