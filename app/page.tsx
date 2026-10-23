import Nav from "@/components/Nav";
import Hero from "@/components/Hero";
import TrustStrip from "@/components/TrustStrip";
import ApplicationSection from "@/components/ApplicationSection";
import CaseStudies from "@/components/CaseStudies";
import Method from "@/components/Method";
import Capabilities from "@/components/Capabilities";
import Fit from "@/components/Fit";
import Program from "@/components/Program";
import Faq from "@/components/Faq";
import FinalCta from "@/components/FinalCta";
import Footer from "@/components/Footer";

export default function HomePage() {
  return (
    <>
      <Nav />
      <main id="main">
        <Hero />
        <TrustStrip />
        <ApplicationSection />
        <CaseStudies />
        <Method />
        <Capabilities />
        <Fit />
        <Program />
        <Faq />
        <FinalCta />
      </main>
      <Footer />
    </>
  );
}
