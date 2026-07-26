"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Send, Paperclip } from "lucide-react";
import { Eyebrow } from "./Atoms";
import {
  SHIPYARD_ITEMS,
  DECK_MACHINERY_ITEMS,
  BRONZE_ITEMS,
  BEARING_SERVICES,
} from "../lib/data";

const RECIPIENT_EMAIL = "deboratochaudhury2023@gmail.com";

// Product categories
const PRODUCT_CATEGORIES = [
  { key: "shipyard", label: "Shipyard Products", items: SHIPYARD_ITEMS },
  { key: "deck", label: "Deck Machinery", items: DECK_MACHINERY_ITEMS },
  { key: "bronze", label: "Bronze Items", items: BRONZE_ITEMS },
  { key: "bearing", label: "White Metal Lining", items: BEARING_SERVICES },
];

// Google Maps embed
const MAP_QUERY =
  "135, Rafi Ahmed Kidwai Road, Kolkata, West Bengal 700055";

const MAP_EMBED_SRC = `https://www.google.com/maps?q=${encodeURIComponent(
  MAP_QUERY
)}&output=embed`;

export default function ContactSection() {
  const searchParams = useSearchParams();

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    category: "",
    product: "",
    message: "",
  });

  const [file, setFile] = useState(null);
  const [status, setStatus] = useState("idle"); // idle | sending | sent | error

  // Pre-fill category & product when arriving from a product page's
  // "Request a Quote" link (e.g. /contact?category=shipyard&product=Lockers)
  useEffect(() => {
    const categoryParam = searchParams.get("category");
    const productParam = searchParams.get("product");

    if (!categoryParam) return;

    const matchedCategory = PRODUCT_CATEGORIES.find(
      (cat) => cat.key === categoryParam
    );
    if (!matchedCategory) return;

    let matchedProduct = "";
    if (productParam) {
      const found = matchedCategory.items.find(
        (item) =>
          (item.title || item.name)?.toLowerCase() ===
          productParam.toLowerCase()
      );
      if (found) matchedProduct = found.title || found.name;
    }

    setForm((prev) => ({
      ...prev,
      category: matchedCategory.key,
      product: matchedProduct,
    }));
  }, [searchParams]);

  const handleChange = (e) =>
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });

  const handleFileChange = (e) =>
    setFile(e.target.files?.[0] || null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("sending");

    try {
      const data = new FormData();

      data.append("firstName", form.firstName);
      data.append("lastName", form.lastName);
      data.append("email", form.email);
      data.append("phone", form.phone);
      data.append("category", form.category);
      data.append("product", form.product);
      data.append("message", form.message);

      if (file) {
        data.append("attachment", file);
      }

      const res = await fetch("/api/contact", {
        method: "POST",
        body: data,
      });

      if (!res.ok) {
        throw new Error("Request failed");
      }

      setStatus("sent");
    } catch (err) {
      console.error(err);
      setStatus("error");

      // Fallback to mail client
      const subject = encodeURIComponent(
        `New enquiry from ${form.firstName} ${form.lastName} — Taraknath website`
      );

      const body = encodeURIComponent(
        `Name: ${form.firstName} ${form.lastName}\n` +
          `Email: ${form.email}\n` +
          `Phone: ${form.phone}\n` +
          `Category: ${form.category}\n` +
          `Product: ${form.product}\n\n` +
          `Message:\n${form.message}` +
          (file
            ? `\n\n(Attachment "${file.name}" could not be sent automatically — please attach it manually in your email app.)`
            : "")
      );

      window.location.href = `mailto:${RECIPIENT_EMAIL}?subject=${subject}&body=${body}`;
    }
  };

  const resetForm = () => {
    setForm({
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      category: "",
      product: "",
      message: "",
    });

    setFile(null);
    setStatus("idle");
  };

  return (
    <section id="contact" className="bg-gray-900 text-white">
      {/* Hero bar */}
      <div className="border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 py-16 sm:py-20 text-center">
          <Eyebrow className="flex justify-center text-red-500">
            We'd Love to Hear From You
          </Eyebrow>

          <h2 className="text-3xl sm:text-4xl font-bold heading-font uppercase mb-4">
            Contact Us
          </h2>

          <p className="text-gray-400 text-sm sm:text-base max-w-lg mx-auto">
            Reach out to our team for product enquiries, quotes or any other
            information about our engineering capabilities.
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-5 sm:px-8 py-14 sm:py-20">
        {/* Contact details */}
        <div className="mb-10">
          <h3 className="text-2xl font-bold heading-font mb-6">
            We'd Love to Hear From You
          </h3>

          <p className="font-bold text-white mb-4">
            Taraknath Engineering Works
          </p>

          <div className="space-y-2 text-sm">
            <p>
              <span className="font-bold text-white">Email: </span>

              <a
                href="mailto:taraknathengwks@yahoo.co.in"
                className="text-red-400 underline hover:text-red-300 transition-colors"
              >
                taraknathengwks@yahoo.co.in
              </a>
            </p>

            <p>
              <span className="font-bold text-white">Phone: </span>

              <a
                href="tel:+919331970742"
                className="text-red-400 underline hover:text-red-300 transition-colors"
              >
                +91 93319 70742
              </a>

              <span className="text-gray-500"> · </span>

              <a
                href="tel:+918617772635"
                className="text-red-400 underline hover:text-red-300 transition-colors"
              >
                +91 86177 72635
              </a>

              <span className="text-gray-500"> · </span>

              <a
                href="tel:+919804856613"
                className="text-red-400 underline hover:text-red-300 transition-colors"
              >
                +91 98048 56613
              </a>
            </p>

            <p className="font-bold text-white pt-2">Office Address:</p>

            <p className="text-gray-300">
              135, Rafi Ahmed Kidwai Road
            </p>

            <p className="text-gray-300">
              Kolkata – 700 055, West Bengal
            </p>

            <p className="font-bold text-white pt-2">Works Address:</p>

            <p className="text-gray-300">
              Vill + P.O. Kulgachia, P.S. Uluberia
            </p>

            <p className="text-gray-300">
              Dist. Howrah, West Bengal
            </p>
          </div>
        </div>

        {/* Map */}
        <div className="mb-10 border border-gray-700 overflow-hidden">
          <iframe
            title="Taraknath Engineering Works — Office Location"
            src={MAP_EMBED_SRC}
            width="100%"
            height="360"
            style={{ border: 0 }}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            allowFullScreen
          />
        </div>

        {/* Form */}
        <div>
          {status === "sent" ? (
<div className="h-full flex flex-col items-center justify-center text-center py-16 border border-gray-700">
  <div className="w-14 h-14 bg-red-600 flex items-center justify-center mb-5">
    <Send size={22} className="text-white" />
  </div>

  <h3 className="text-lg font-bold heading-font uppercase mb-2">
    Message Sent
  </h3>

  <p className="text-gray-400 text-sm">
    We'll get back to you as soon as possible.
  </p>

  <button
    onClick={resetForm}
    className="mt-6 text-xs font-semibold tracking-widest uppercase text-red-500 hover:text-red-400 transition-colors"
  >
    Send Another →
  </button>
</div>
) : (
<form onSubmit={handleSubmit}>
  {/* Name */}
  <div className="grid grid-cols-2 gap-4 mb-4">
    <div>
      <label className="block mono text-[10px] tracking-widest uppercase text-gray-400 mb-2">
        First Name <span className="text-red-500">*</span>
      </label>

      <input
        name="firstName"
        value={form.firstName}
        onChange={handleChange}
        required
        className="w-full bg-gray-800 border border-gray-700 text-white text-sm px-4 py-3 focus:outline-none focus:border-red-600 transition-colors"
        placeholder="First name"
      />
    </div>

    <div>
      <label className="block mono text-[10px] tracking-widest uppercase text-gray-400 mb-2">
        Last Name <span className="text-red-500">*</span>
      </label>

      <input
        name="lastName"
        value={form.lastName}
        onChange={handleChange}
        required
        className="w-full bg-gray-800 border border-gray-700 text-white text-sm px-4 py-3 focus:outline-none focus:border-red-600 transition-colors"
        placeholder="Last name"
      />
    </div>
  </div>

  {/* Email */}
  <div className="mb-4">
    <label className="block mono text-[10px] tracking-widest uppercase text-gray-400 mb-2">
      Email <span className="text-red-500">*</span>
    </label>

    <input
      name="email"
      type="email"
      value={form.email}
      onChange={handleChange}
      required
      className="w-full bg-gray-800 border border-gray-700 text-white text-sm px-4 py-3 focus:outline-none focus:border-red-600 transition-colors"
      placeholder="your@email.com"
    />
  </div>

  {/* Phone */}
  <div className="mb-4">
    <label className="block mono text-[10px] tracking-widest uppercase text-gray-400 mb-2">
      Phone
    </label>

    <input
      name="phone"
      type="tel"
      value={form.phone}
      onChange={handleChange}
      className="w-full bg-gray-800 border border-gray-700 text-white text-sm px-4 py-3 focus:outline-none focus:border-red-600 transition-colors"
      placeholder="+91 00000 00000"
    />
  </div>

  {/* Product Category */}
  <div className="mb-4">
    <label className="block mono text-[10px] tracking-widest uppercase text-gray-400 mb-2">
      Product Category
    </label>

    <select
      name="category"
      value={form.category}
      onChange={(e) =>
        setForm({
          ...form,
          category: e.target.value,
          product: "",
        })
      }
      className="w-full bg-gray-800 border border-gray-700 text-white text-sm px-4 py-3 focus:outline-none focus:border-red-600 transition-colors"
    >
      <option value="">Select Category</option>

      {PRODUCT_CATEGORIES.map((category) => (
        <option key={category.key} value={category.key}>
          {category.label}
        </option>
      ))}
    </select>
  </div>

  {/* Product */}
  <div className="mb-4">
    <label className="block mono text-[10px] tracking-widest uppercase text-gray-400 mb-2">
      Product
    </label>

    <select
      name="product"
      value={form.product}
      onChange={handleChange}
      disabled={!form.category}
      className="w-full bg-gray-800 border border-gray-700 text-white text-sm px-4 py-3 focus:outline-none focus:border-red-600 transition-colors disabled:opacity-50"
    >
      <option value="">Select Product</option>

      {PRODUCT_CATEGORIES.find(
        (cat) => cat.key === form.category
      )?.items.map((item) => (
        <option
          key={item.slug || item.id || item.name}
          value={item.title || item.name}
        >
          {item.title || item.name}
        </option>
      ))}
    </select>
  </div>

  {/* Message */}
  <div className="mb-4">
    <label className="block mono text-[10px] tracking-widest uppercase text-gray-400 mb-2">
      Message <span className="text-red-500">*</span>
    </label>

    <textarea
      name="message"
      value={form.message}
      onChange={handleChange}
      required
      rows={5}
      className="w-full bg-gray-800 border border-gray-700 text-white text-sm px-4 py-3 focus:outline-none focus:border-red-600 transition-colors resize-none"
      placeholder="Tell us about your requirements..."
    />
  </div>

  {/* Attachment */}
  <div className="mb-6">
    <label className="block mono text-[10px] tracking-widest uppercase text-gray-400 mb-2">
      Attach a File (optional)
    </label>

    <label
      htmlFor="attachment"
      className="flex items-center gap-3 w-full bg-gray-800 border border-gray-700 text-sm px-4 py-3 cursor-pointer hover:border-red-600 transition-colors"
    >
      <Paperclip size={15} className="text-red-500 flex-shrink-0" />

      <span className="text-gray-300 truncate">
        {file
          ? file.name
          : "Choose a file — drawing, spec sheet, etc."}
      </span>
    </label>

    <input
      id="attachment"
      name="attachment"
      type="file"
      onChange={handleFileChange}
      className="hidden"
    />
  </div>

  {status === "error" && (
    <p className="text-xs text-red-500 mb-4">
      We couldn't reach our messaging service, so we've opened your
      email app with the message pre-filled.
    </p>
  )}

  <button
    type="submit"
    disabled={status === "sending"}
    className="w-full inline-flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors text-white text-xs font-semibold tracking-widest uppercase px-7 py-4"
  >
    {status === "sending" ? "Sending..." : "Send Message"}

    <Send size={14} />
  </button>
</form>
)}
</div>
</div>
</section>
);
}
