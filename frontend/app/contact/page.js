import { Suspense } from "react";
import Header from "../../components/Header";
import ContactSection from "../../components/ContactSection";
import Footer from "../../components/Footer";
import { Divider } from "../../components/Atoms";

export const metadata = {
  title: "Contact Us | Taraknath Engineering Works",
};

export default function ContactPage() {
  return (
    <main>
      <Header />
      <Divider />
      <Suspense fallback={null}>
        <ContactSection />
      </Suspense>
      <Footer />
    </main>
  );
}
