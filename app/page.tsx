import { MobileBar, RevealObserver } from "@/components/ClientBits";
import { CtaBand, Dentist, Faq, Hero, Services, Strip, Technology, Visit } from "@/components/Sections";

export default function Home() {
  return (
    <>
      <main id="main">
        <Hero />
        <Strip />
        <Services />
        <Technology />
        <Dentist />
        <Visit />
        <Faq />
        <CtaBand />
      </main>
      <MobileBar />
      <RevealObserver />
    </>
  );
}
