# Capizonda Dental Clinic: Demo Website

This is a static, mobile-first site for Capizonda Dental Clinic in Molo, Iloilo City. It has no build step.

## Structure

```
index.html            Page markup (hero + motion video, services, why us, dentist, booking, visit, FAQ)
css/styles.css        All styles (brand tokens at the top)
js/main.js            Nav, scroll reveals, "open now" status (PH time), mobile action bar
js/booking.js         3-step booking flow (service, schedule, details), service list lives here
js/motion.js          Motion graphic video (GSAP timeline, ~27s loop, portrait layout on phones)
assets/img/           Logo layers, dentist photo, clinic photo, favicon, social share image
```

## Run locally

```
python -m http.server 5173
```

Then open http://127.0.0.1:5173

## Deploy

Any static host works:

- **Netlify Drop**: drag the project folder onto https://app.netlify.com/drop
- **Vercel**: `npx vercel` in this folder
- **GitHub Pages**: push to a repo, then go to Settings > Pages and deploy from the branch root

After deploying, change `og:image` in `index.html` to the absolute URL (for example `https://your-domain/assets/img/og-cover.jpg`). This makes link previews show the logo in Messenger and Facebook.

## Demo limitations

- Booking requests are saved only in the visitor's browser (localStorage). The clinic is not notified automatically. On the success screen, the "Text the clinic now" button opens an SMS to 0962 687 6076 with the booking details already filled in. For production, connect the form to a backend such as Formspree, Google Sheets, or a database.
- Some time slots show as "booked". These are simulated so the demo calendar looks realistic. See `seededTaken()` in `js/booking.js`.
- Confirm the service list and durations with the clinic. Edit `SERVICES` in `js/booking.js`.
- The dentist photo was cropped from a low-resolution poster. Replace `assets/img/dr-capizonda.jpg` and `dr-capizonda-head.jpg` with HD photos.
