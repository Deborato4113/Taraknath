"use client";

import { useState } from "react";
import { Play, MapPin, Phone, Mail, Send } from "lucide-react";
import { Eyebrow, Reveal } from "./Atoms";

const CUSTOMER_LOGOS = [
  { name: "Garden Reach Shipbuilders & Engineers Ltd, Kolkata", short: "GRSE", logo: "/logos/grse.png", url: "https://grse.in/" },
  { name: "Dumdum Valves & Bearings (P) Ltd", short: "Dumdum Valves", logo: null, url: null },
  { name: "SAIL – Durgapur Steel Plant, Durgapur", short: "SAIL", logo: "/logos/sail.png", url: "https://www.sail.co.in/en/plants/about-durgapur-steel-plant" },
  { name: "B. Fouress Pvt. Ltd, Bangalore", short: "B. Fouress", logo: "/logos/bfl.png", url: "https://bflhydro.com/" },
  { name: "Power Grid Corporation of India Ltd", short: "Powergrid", logo: "/logos/powergrid.png", url: "https://www.powergrid.in/en/" },
  { name: "K.K.K Hydro Power (P) Ltd, Uttarakhand", short: "KKK Hydro", logo: "/logos/kkk-hydro.png", url: "https://kkkhydropower.com/" },
  { name: "Gowthami Hydro Electric Company (P) Ltd, HP", short: "Gowthami Hydro", logo: null, url: null },
  { name: "Greenko Group, Hyderabad", short: "Greenko", logo: "/logos/greenko.png", url: "https://www.greenkogroup.com/" },
];

export function AboutSection() {
  return (
    <section className="bg-gray-50 py-20 sm:py-24">
      <div className="max-w-7xl mx-auto px-5 sm:px-8">
        <div className="grid lg:grid-cols-2 gap-14 items-center">
          <Reveal>
            <Eyebrow>Who We Are</Eyebrow>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 heading-font uppercase mb-6">
              About Taraknath Engineering Works
            </h2>
            <p className="text-gray-600 text-sm leading-relaxed mb-5">
              Taraknath Engineering Works is an ISO 9001:2015 certified manufacturer
              headquartered in Kolkata, with production facilities in Kulgachia, Howrah.
              We have spent decades supplying precision-engineered components to India's
              foremost naval shipyard — Garden Reach Shipbuilders &amp; Engineers Limited (GRSE).
            </p>
            <p className="text-gray-600 text-sm leading-relaxed mb-8">
              Our capabilities span shipyard outfitting products, heavy deck machinery,
              copper-base bronze castings, and white metal lining journal bearings —
              all manufactured to project specification and verified to ISO or customer
              standard before delivery.
            </p>
            <div className="grid grid-cols-2 gap-5">
              {[
                ["ISO 9001:2015", "Quality Certified"],
                ["ASNT Level 2", "Operator Qualified"],
                ["100% Ultrasonic", "Bond Verification"],
                ["24 / 7", "Emergency Service"],
              ].map(([val, label]) => (
                <div key={label} className="bg-white border border-gray-200 px-5 py-4">
                  <p className="font-bold text-red-600 heading-font text-lg">{val}</p>
                  <p className="mono text-[10px] text-gray-500 tracking-widest uppercase mt-1">{label}</p>
                </div>
              ))}
            </div>
          </Reveal>

          <Reveal delay={120}>
            <div className="space-y-4">
              {[
                { label: "Office", value: "135, Rafi Ahmed Kidwai Road, Kolkata – 700 055" },
                { label: "Works", value: "Vill + P.O. Kulgachia, P.S. Uluberia, Dist. Howrah, West Bengal" },
                { label: "Phone", value: "9331970742 / 8617772635 / 9804856613" },
                { label: "Fax", value: "033-2529-6513" },
                { label: "Email", value: "taraknathengwks@yahoo.co.in" },
              ].map(({ label, value }) => (
                <div key={label} className="flex gap-4 border-b border-gray-200 pb-4">
                  <span className="mono text-[10px] text-blue-800 tracking-widest uppercase w-14 flex-shrink-0 pt-0.5">
                    {label}
                  </span>
                  <span className="text-sm text-gray-700">{value}</span>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

export function VideoSection() {
  return (
    <div className="relative bg-gray-900 text-white overflow-hidden">
      <div
        className="absolute -left-20 -bottom-20 w-[420px] h-[420px] rounded-full opacity-[0.08] pointer-events-none"
        style={{ background: "radial-gradient(circle, #1E3A8A 0%, transparent 70%)" }}
        aria-hidden="true"
      />
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-red-600/50 to-transparent" aria-hidden="true" />
      <div className="relative max-w-7xl mx-auto px-5 sm:px-8 py-20 sm:py-28 text-center">
        <Reveal>
          <Eyebrow className="flex justify-center">On The Floor</Eyebrow>
          <h2 className="text-2xl sm:text-3xl font-bold mb-9 heading-font uppercase">
            Watch Our Work
          </h2>
        </Reveal>
        <Reveal delay={150}>
          <button
            className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-red-600 hover:bg-red-700 hover:scale-110 transition-all flex items-center justify-center mx-auto ring-1 ring-red-500/40 ring-offset-8 ring-offset-gray-900"
            aria-label="Play video"
          >
            <Play className="text-white ml-1" size={24} fill="white" />
          </button>
        </Reveal>
      </div>
    </div>
  );
}

export function CustomersSection() {
  const [hoveredIdx, setHoveredIdx] = useState(null);
  const [paused, setPaused] = useState(false);
  const logos = [...CUSTOMER_LOGOS, ...CUSTOMER_LOGOS];

  return (
    <section className="bg-white py-20 sm:py-24 overflow-hidden">
      <div className="max-w-7xl mx-auto px-5 sm:px-8">
        <Reveal className="text-center mb-16">
          <Eyebrow className="flex justify-center text-red-600">Trusted By</Eyebrow>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 heading-font uppercase">
            Our Customers
          </h2>
          <p className="text-gray-500 text-sm mt-3 mono tracking-wide">
            Hover to explore · Click to pause
          </p>
        </Reveal>
      </div>

      <div
        className="relative cursor-pointer"
        onClick={() => setPaused((p) => !p)}
      >
        {/* Fade edges */}
        <div className="pointer-events-none absolute inset-y-0 left-0 w-24 sm:w-40 z-10"
          style={{ background: "linear-gradient(to right, #ffffff, transparent)" }} />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-24 sm:w-40 z-10"
          style={{ background: "linear-gradient(to left, #ffffff, transparent)" }} />


        <div
          className="flex w-max"
          style={{
            animation: `marqueeScroll 35s linear infinite`,
            animationPlayState: paused ? "paused" : "running",
          }}
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          {logos.map((customer, i) => {
            const CardWrapper = ({ children }) => customer.url ? (
              <a href={customer.url} target="_blank" rel="noopener noreferrer" title={customer.name}>
                {children}
              </a>
            ) : <>{children}</>;

       return (
  <div
    key={`${customer.name}-${i}`}
    className="relative flex-shrink-0 mx-8"
    onMouseEnter={() => setHoveredIdx(i)}
    onMouseLeave={() => setHoveredIdx(null)}
  >
    <CardWrapper>
      <>
        <div
          className="flex flex-col items-center justify-center transition-all duration-300"
          style={{
            width: "240px",
            height: "140px",
            transform:
              hoveredIdx === i
                ? "translateY(-5px) scale(1.08)"
                : "translateY(0) scale(1)",
          }}
        >
          {customer.logo ? (
            <img
              src={customer.logo}
              alt={customer.short}
              className="object-contain transition-all duration-300"
              style={{
                maxHeight: "108px",
                maxWidth: "95%",
                filter:
                  hoveredIdx === i
                    ? "grayscale(0%) drop-shadow(0 8px 16px rgba(0,0,0,0.12))"
                    : "grayscale(100%) opacity(0.5)",
              }}
            />
          ) : (
            <p
              className="font-bold text-center leading-snug transition-all duration-300 heading-font uppercase text-base"
              style={{
                color: hoveredIdx === i ? "#111827" : "#9ca3af",
              }}
            >
              {customer.short}
            </p>
          )}
        </div>

        <div
          className="absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap mono text-[10px] text-gray-500 tracking-wide text-center transition-all duration-200 pointer-events-none"
          style={{
            opacity: hoveredIdx === i ? 1 : 0,
            transform: `translateX(-50%) translateY(${
              hoveredIdx === i ? "0px" : "4px"
            })`,
          }}
        >
          {customer.url ? `↗ ${customer.short}` : customer.short}
        </div>
      </>
    </CardWrapper>
  </div>
);
})}
        </div>
      </div>
    </section>
  );
}

export function ContactSection() {
  const [form, setForm] = useState({ name: "", email: "", phone: "", message: "" });
  const [sent, setSent] = useState(false);

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    setSent(true);
    setForm({ name: "", email: "", phone: "", message: "" });
  };

  return (
    <div className="bg-gray-50 py-20 sm:py-24">
      <div className="max-w-7xl mx-auto px-5 sm:px-8">
        <div className="grid lg:grid-cols-2 gap-14">
          <Reveal>
            <Eyebrow>Get In Touch</Eyebrow>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 heading-font uppercase mb-6">
              Contact Us
            </h2>
            <p className="text-gray-500 text-sm leading-relaxed mb-8">
              For enquiries, quotations or project specifications, reach out through
              the form or contact us directly. We respond to all enquiries within one
              business day.
            </p>
            <div className="space-y-5">
              {[
                { Icon: MapPin, text: "135, Rafi Ahmed Kidwai Road, Kolkata – 700 055" },
                { Icon: Phone, text: "9331970742 / 8617772635" },
                { Icon: Mail, text: "taraknathengwks@yahoo.co.in" },
              ].map(({ Icon, text }, i) => (
                <div key={i} className="flex items-start gap-4">
                  <div className="w-9 h-9 bg-red-600 flex items-center justify-center flex-shrink-0">
                    <Icon size={15} className="text-white" />
                  </div>
                  <span className="text-sm text-gray-700 pt-1.5">{text}</span>
                </div>
              ))}
            </div>
          </Reveal>

          <Reveal delay={120}>
            {sent ? (
              <div className="bg-white border border-gray-200 p-10 flex flex-col items-center justify-center text-center h-full">
                <div className="w-14 h-14 bg-blue-800 flex items-center justify-center mb-5">
                  <Send size={22} className="text-white" />
                </div>
                <h3 className="font-bold text-gray-900 heading-font uppercase text-lg mb-2">
                  Message Received
                </h3>
                <p className="text-gray-500 text-sm">
                  Thank you for reaching out. We will get back to you within one business day.
                </p>
                <button
                  onClick={() => setSent(false)}
                  className="mt-6 text-xs font-semibold tracking-widest uppercase text-red-600 border border-red-600 px-5 py-2.5 hover:bg-red-600 hover:text-white transition-colors"
                >
                  Send Another
                </button>
              </div>
            ) : (
              <div className="bg-white border border-gray-200 p-7 sm:p-9">
                <div className="space-y-5">
                  <div className="grid sm:grid-cols-2 gap-5">
                    {[
                      { name: "name", label: "Full Name", type: "text" },
                      { name: "phone", label: "Phone Number", type: "tel" },
                    ].map(({ name, label, type }) => (
                      <div key={name}>
                        <label className="block mono text-[10px] tracking-widest uppercase text-gray-500 mb-2">
                          {label}
                        </label>
                        <input
                          type={type}
                          name={name}
                          value={form[name]}
                          onChange={handleChange}
                          className="w-full border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 focus:outline-none focus:border-red-600 transition-colors"
                          placeholder={label}
                        />
                      </div>
                    ))}
                  </div>
                  <div>
                    <label className="block mono text-[10px] tracking-widest uppercase text-gray-500 mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      className="w-full border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 focus:outline-none focus:border-red-600 transition-colors"
                      placeholder="your@email.com"
                    />
                  </div>
                  <div>
                    <label className="block mono text-[10px] tracking-widest uppercase text-gray-500 mb-2">
                      Message
                    </label>
                    <textarea
                      name="message"
                      value={form.message}
                      onChange={handleChange}
                      rows={4}
                      className="w-full border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 focus:outline-none focus:border-red-600 transition-colors resize-none"
                      placeholder="Tell us about your requirement..."
                    />
                  </div>
                  <button
                    onClick={handleSubmit}
                    className="w-full bg-gray-900 hover:bg-red-600 transition-colors text-white text-xs font-semibold tracking-[0.2em] uppercase py-4 flex items-center justify-center gap-2"
                  >
                    Send Enquiry <Send size={14} />
                  </button>
                </div>
              </div>
            )}
          </Reveal>
        </div>
      </div>
    </div>
  );
}