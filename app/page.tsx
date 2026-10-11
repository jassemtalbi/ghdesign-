import Cursor from "./components/Cursor";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import Collections from "./components/Collections";
import About from "./components/About";
import Footer from "./components/Footer";

export default function Home() {
  return (
    <>
      <Cursor />
      <Navbar />
      <main>
        <Hero />
        <Collections id="femme" eyebrow="Pour Elle" title="Femme" gender="femme" />
        <Collections id="homme" eyebrow="Pour Lui" title="Homme" gender="homme" />
        <Collections />
        <About />
      </main>
      <Footer />
    </>
  );
}
