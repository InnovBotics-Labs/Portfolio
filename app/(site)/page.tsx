import { Hero } from "@/components/sections/Hero";
import { AppStore } from "@/components/sections/AppStore";
import { Work } from "@/components/sections/Work";
import { About } from "@/components/sections/About";
import { Experience } from "@/components/sections/Experience";
import { Contact } from "@/components/sections/Contact";

export default function Home() {
  return (
    <main id="top">
      <Hero />
      <AppStore />
      <Work />
      <About />
      <Experience />
      <Contact />
    </main>
  );
}
