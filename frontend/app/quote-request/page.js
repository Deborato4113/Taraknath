"use client";

import { Suspense, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Plus, Trash2, CheckCircle2 } from "lucide-react";
import Header from "../../components/Header";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export default function QuoteRequestPage() {
  return (
    <Suspense fallback={null}>
      <QuoteRequestPageInner />
    </Suspense>
  );
}

function QuoteRequestPageInner() {
  const { status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();

  const prefillProductId = searchParams.get("productId") || "";
  const prefillProductName = searchParams.get("productName") || "";

  const [products, setProducts] = useState([]);
  const [items, setItems] = useState([{ productId: prefillProductId, quantity: 1, note: "" }]);
  const [projectRef, setProjectRef] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push(`/login?callbackUrl=${encodeURIComponent("/quote-request")}`);
    }
  }, [status, router]);

  useEffect(() => {
    fetch(`${API_URL}/api/products`)
      .then((res) => res.json())
      .then((data) => Array.isArray(data) && setProducts(data))
      .catch(() => {});
  }, []);

  function updateItem(index, field, value) {
    setItems((prev) => prev.map((it, i) => (i === index ? { ...it, [field]: value } : it)));
  }

  function addRow() {
    setItems((prev) => [...prev, { productId: "", quantity: 1, note: "" }]);
  }

  function removeRow(index) {
    setItems((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    const validItems = items.filter((it) => it.productId && it.quantity > 0);
    if (validItems.length === 0) {
      setError("Add at least one product with a quantity.");
      return;
    }

    setSubmitting(true);
    const res = await fetch("/api/quotes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ projectRef, message, items: validItems }),
    });
    const data = await res.json();
    setSubmitting(false);

    if (!res.ok) {
      setError(data.error || "Failed to submit quote request");
      return;
    }
    setSubmitted(true);
  }

  const inputClass = "w-full border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:border-blue-800";
  const labelClass = "block mono text-[10px] font-semibold tracking-widest uppercase text-gray-500 mb-1.5";

  if (submitted) {
    return (
      <div className="min-h-screen bg-white flex flex-col" style={{ fontFamily: "'Inter', sans-serif" }}>
        <Header />
        <div className="flex-1 max-w-lg mx-auto w-full px-5 py-24 text-center">
          <CheckCircle2 size={48} className="text-green-600 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 heading-font uppercase mb-3">Quote Request Sent</h1>
          <p className="text-gray-500 text-sm mb-8">
            Thanks — our team will review your request and follow up directly by phone or email with pricing.
          </p>
          <Link
            href="/"
            className="inline-block bg-gray-900 hover:bg-red-600 transition-colors text-white text-xs font-semibold tracking-widest uppercase px-7 py-4"
          >
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col" style={{ fontFamily: "'Inter', sans-serif" }}>
      <Header />

      <div className="flex-1 max-w-2xl mx-auto w-full px-5 sm:px-8 py-16">
        <p className="mono text-[11px] font-semibold tracking-[0.3em] text-red-600 uppercase mb-2 text-center">
          Bulk Orders
        </p>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 heading-font uppercase mb-2 text-center">
          Request a Quote
        </h1>
        <p className="text-center text-sm text-gray-500 mb-10 max-w-md mx-auto">
          For project-based or bulk orders. List the items and quantities you need — our team will follow up
          with pricing directly, no payment needed here.
          {prefillProductName && (
            <> Prefilled with <strong>{prefillProductName}</strong> — adjust as needed.</>
          )}
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <div>
            <label className={labelClass}>Items</label>
            <div className="flex flex-col gap-3">
              {items.map((item, i) => (
                <div key={i} className="flex flex-col sm:flex-row gap-2 border border-gray-200 p-3">
                  <select
                    value={item.productId}
                    onChange={(e) => updateItem(i, "productId", e.target.value)}
                    className={`${inputClass} sm:flex-1`}
                    required
                  >
                    <option value="">Select a product…</option>
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>
                    ))}
                  </select>
                  <input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) => updateItem(i, "quantity", Number(e.target.value))}
                    placeholder="Qty"
                    className={`${inputClass} sm:w-24`}
                    required
                  />
                  <input
                    value={item.note}
                    onChange={(e) => updateItem(i, "note", e.target.value)}
                    placeholder="Note (spec, size…) — optional"
                    className={`${inputClass} sm:flex-1`}
                  />
                  {items.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeRow(i)}
                      className="text-red-600 hover:text-red-700 px-2 self-center"
                      aria-label="Remove item"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={addRow}
              className="mt-3 inline-flex items-center gap-1.5 text-blue-800 text-xs font-semibold hover:underline"
            >
              <Plus size={14} /> Add another item
            </button>
          </div>

          <div>
            <label className={labelClass}>Project / PO Reference (optional)</label>
            <input
              value={projectRef}
              onChange={(e) => setProjectRef(e.target.value)}
              className={inputClass}
              placeholder="e.g. YD: FPV 2113–2117"
            />
          </div>

          <div>
            <label className={labelClass}>Additional Details (optional)</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
              className={inputClass}
              placeholder="Delivery timeline, specifications, or anything else we should know"
            />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="bg-red-600 hover:bg-red-700 disabled:opacity-60 text-white text-xs font-semibold tracking-widest uppercase px-7 py-4 transition-colors"
          >
            {submitting ? "Submitting…" : "Submit Quote Request"}
          </button>
        </form>
      </div>
    </div>
  );
}
