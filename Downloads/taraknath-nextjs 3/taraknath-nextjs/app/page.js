"use client";

import { useRef } from "react";
import Header from "../components/Header";
import Hero from "../components/Hero";
import Products from "../components/Products";
import { VideoSection, CustomersSection } from "../components/Sections";
import { Divider } from "../components/Atoms";
import Footer from "../components/Footer";

export default function Home() {
  const productsSectionRef = useRef(null);

  const handleExplore = () => {
    productsSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <main>
      <Header />
      <Divider />

      <section id="home">
        <Hero onExplore={handleExplore} />
      </section>

      <Divider />

      <section id="about" className="bg-white py-20 sm:py-24">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          <div>
            <p className="mono text-[11px] font-semibold tracking-[0.3em] text-red-600 uppercase mb-3">
              Who We Are
            </p>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 heading-font uppercase mb-6">
              Decades of Precision Engineering
            </h2>
            <p className="text-gray-500 text-sm sm:text-base leading-relaxed mb-5">
              Taraknath Engineering Works is an ISO 9001:2015 certified manufacturer
              based in Kolkata, West Bengal. We supply shipyard products, deck
              machinery components, bronze castings and white metal lining journal
              bearings to India's leading naval and industrial organisations.
            </p>
            <p className="text-gray-500 text-sm sm:text-base leading-relaxed mb-8">
              Our works facility is located at Kulgachia, Uluberia, Dist. Howrah —
              equipped to handle centrifugal white metal lining, ultrasonic bond
              verification and precision machining under one roof.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
              {[
                ["ISO 9001:2015", "Certified"],
                ["ASNT Level 2", "Operators"],
                ["100%", "UT Verified"],
              ].map(([val, label]) => (
                <div key={label} className="border-l-2 border-red-600 pl-4">
                  <p className="text-lg font-bold heading-font text-gray-900">{val}</p>
                  <p className="mono text-[10px] text-gray-400 tracking-wide uppercase mt-0.5">{label}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-gray-100 border border-gray-200 aspect-video flex items-center justify-center">
            <span className="mono text-[11px] text-gray-400 tracking-widest uppercase">
              Image Placeholder
            </span>
          </div>
        </div>
      </section>

      <Divider />

      <section id="products" ref={productsSectionRef}>
        <Products />
      </section>

      <Divider />

      <section id="services">
        <VideoSection />
      </section>

      <Divider />

      <CustomersSection />

      <Footer />
    </main>
  );
}