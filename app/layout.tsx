import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { Great_Vibes, Instrument_Serif, Montserrat, Plus_Jakarta_Sans } from "next/font/google";
import { SiteFooter } from "@/components/Sections";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteProvider } from "@/components/SiteProvider";
import "./globals.css";

const montserrat = Montserrat({ subsets: ["latin"], weight: ["500", "600", "700", "800"], variable: "--font-montserrat" });
const jakarta = Plus_Jakarta_Sans({ subsets: ["latin"], weight: ["400", "500", "600", "700"], variable: "--font-jakarta" });
const instrument = Instrument_Serif({ subsets: ["latin"], weight: "400", style: ["normal", "italic"], variable: "--font-instrument" });
const vibes = Great_Vibes({ subsets: ["latin"], weight: "400", variable: "--font-vibes" });

// On Vercel this resolves to the production domain, so link previews get an absolute image URL.
const siteUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL
  ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
  : "http://localhost:3000";

const description =
  "Capizonda Dental Clinic in Brgy. West Habog-Habog, Molo, Iloilo City. Your smile is our passion. Book your dental appointment online, Monday to Saturday 9 AM to 5 PM.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Capizonda Dental Clinic | Dentist in Molo, Iloilo City",
    template: "%s | Capizonda Dental Clinic",
  },
  description,
  icons: { icon: "/assets/img/favicon.png", apple: "/assets/img/logo-full.jpg" },
  openGraph: {
    type: "website",
    title: "Capizonda Dental Clinic | Your smile is our passion!",
    description: "Book your dental appointment online. Monday to Saturday, 9 AM to 5 PM. Molo, Iloilo City.",
    images: [{ url: "/assets/img/og-cover.jpg", width: 1200, height: 630 }],
  },
  twitter: { card: "summary_large_image" },
};

export const viewport: Viewport = {
  // Metadata cannot read CSS variables: keep in sync with --navy-700 in app/globals.css.
  themeColor: "#1C3E61",
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${montserrat.variable} ${jakarta.variable} ${instrument.variable} ${vibes.variable}`}
      suppressHydrationWarning
    >
      <body>
        {/* Scroll-reveal styles only apply when JS runs, so content stays visible without it */}
        <Script id="js-flag" strategy="beforeInteractive">{`document.documentElement.classList.add("js")`}</Script>
        <SiteProvider>
          <a className="skip-link" href="#main">Skip to content</a>
          <SiteHeader />
          {children}
          <SiteFooter />
        </SiteProvider>
      </body>
    </html>
  );
}
