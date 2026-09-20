"use client";

import { useEffect, useState } from "react";
import { Trash2 } from "lucide-react";

const EMPTY_FORM = {
  code: "",
  type: "PERCENT",
  value: "",
  minOrderValue: "",
  maxDiscount: "",
  usageLimit: "",
  expiresAt: "",
};

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState(null);
  const [error, setError] = useState("");
  const [formError, setFormError] = useState("");
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [busyId, setBusyId] = useState(null);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    const res = await fetch("/api/admin/coupons");
    const data = await res.json();
    if (!res.ok) return setError(data.error || "Failed to load coupons");
    setCoupons(data);
  }

  function updateField(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleCreate(e) {
    e.preventDefault();
    setFormError("");
    setSaving(true);

    const res = await fetch("/api/admin/coupons", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    setSaving(false);

    if (!res.ok) {
      setFormError(data.error || "Failed to create coupon");
      return;
    }

    setForm(EMPTY_FORM);
    setCoupons((prev) => [data, ...(prev || [])]);
  }

  async function toggleActive(coupon) {
    setBusyId(coupon.id);
    const res = await fetch(`/api/admin/coupons/${coupon.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !coupon.isActive }),
    });
    const data = await res.json();
    setBusyId(null);
    if (res.ok) {
      setCoupons((prev) => prev.map((c) => (c.id === coupon.id ? data : c)));
    }
  }

  async function handleDelete(id) {
    if (!confirm("Delete this coupon? This can't be undone.")) return;
    setBusyId(id);
    const res = await fetch(`/api/admin/coupons/${id}`, { method: "DELETE" });
    const data = await res.json();
    setBusyId(null);
    if (res.ok) {
      setCoupons((prev) => prev.filter((c) => c.id !== id));
    } else {
      alert(data.error || "Failed to delete coupon");
    }
  }

  return (
    <div>
      <p className="mono text-[11px] font-semibold tracking-[0.3em] text-red-600 uppercase mb-2">
        Checkout
      </p>
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 heading-font uppercase mb-8">
        Discount Coupons
      </h1>

      {/* Create form */}
      <form
        onSubmit={handleCreate}
        className="bg-white border border-gray-200 p-5 mb-10 grid sm:grid-cols-3 gap-4"
      >
        <div className="sm:col-span-3">
          <p className="mono text-[10px] font-semibold tracking-widest uppercase text-gray-500 mb-3">
            New Coupon
          </p>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">Code</label>
          <input
            required
            placeholder="WELCOME10"
            value={form.code}
            onChange={(e) => updateField("code", e.target.value)}
            className="w-full border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:border-blue-800 uppercase"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">Type</label>
          <select
            value={form.type}
            onChange={(e) => updateField("type", e.target.value)}
            className="w-full border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:border-blue-800"
          >
            <option value="PERCENT">Percentage off</option>
            <option value="FLAT">Flat amount off (₹)</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">
            Value {form.type === "PERCENT" ? "(%)" : "(₹)"}
          </label>
          <input
            required
            type="number"
            min="0"
            step="0.01"
            value={form.value}
            onChange={(e) => updateField("value", e.target.value)}
            className="w-full border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:border-blue-800"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">Min order value (₹, optional)</label>
          <input
            type="number"
            min="0"
            step="0.01"
            value={form.minOrderValue}
            onChange={(e) => updateField("minOrderValue", e.target.value)}
            className="w-full border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:border-blue-800"
          />
        </div>

        {form.type === "PERCENT" && (
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Max discount cap (₹, optional)</label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={form.maxDiscount}
              onChange={(e) => updateField("maxDiscount", e.target.value)}
              className="w-full border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:border-blue-800"
            />
          </div>
        )}

        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">Usage limit (optional)</label>
          <input
            type="number"
            min="1"
            step="1"
            placeholder="Unlimited"
            value={form.usageLimit}
            onChange={(e) => updateField("usageLimit", e.target.value)}
            className="w-full border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:border-blue-800"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">Expires on (optional)</label>
          <input
            type="date"
            value={form.expiresAt}
            onChange={(e) => updateField("expiresAt", e.target.value)}
            className="w-full border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:border-blue-800"
          />
        </div>

        <div className="sm:col-span-3 flex items-center gap-4">
          {formError && <p className="text-red-600 text-sm">{formError}</p>}
          <button
            type="submit"
            disabled={saving}
            className="ml-auto inline-flex items-center justify-center bg-red-600 hover:bg-red-700 disabled:opacity-60 transition-colors text-white text-xs font-semibold tracking-widest uppercase px-6 py-3"
          >
            {saving ? "Creating..." : "Create Coupon"}
          </button>
        </div>
      </form>

      {error && <p className="text-sm text-red-600 mb-4">{error}</p>}

      {!coupons ? (
        <p className="text-sm text-gray-500">Loading…</p>
      ) : coupons.length === 0 ? (
        <p className="text-sm text-gray-500">No coupons yet — create one above.</p>
      ) : (
        <div className="overflow-x-auto border border-gray-200">
          <table className="w-full text-sm min-w-[720px]">
            <thead>
              <tr className="bg-gray-50 text-left mono text-[10px] font-semibold tracking-widest uppercase text-gray-500">
                <th className="px-4 py-3">Code</th>
                <th className="px-4 py-3">Discount</th>
                <th className="px-4 py-3">Min Order</th>
                <th className="px-4 py-3">Usage</th>
                <th className="px-4 py-3">Expires</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {coupons.map((c) => (
                <tr key={c.id}>
                  <td className="px-4 py-3 font-mono font-semibold text-gray-900">{c.code}</td>
                  <td className="px-4 py-3 text-gray-700">
                    {c.type === "PERCENT" ? `${Number(c.value)}%` : `₹${Number(c.value).toLocaleString("en-IN")}`}
                    {c.type === "PERCENT" && c.maxDiscount != null && (
                      <span className="text-gray-400"> (cap ₹{Number(c.maxDiscount).toLocaleString("en-IN")})</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-700">
                    {c.minOrderValue != null ? `₹${Number(c.minOrderValue).toLocaleString("en-IN")}` : "—"}
                  </td>
                  <td className="px-4 py-3 text-gray-700">
                    {c.timesUsed}{c.usageLimit != null ? ` / ${c.usageLimit}` : ""}
                  </td>
                  <td className="px-4 py-3 text-gray-700">
                    {c.expiresAt ? new Date(c.expiresAt).toLocaleDateString("en-IN") : "—"}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => toggleActive(c)}
                      disabled={busyId === c.id}
                      className={`px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide disabled:opacity-50 ${
                        c.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {c.isActive ? "Active" : "Inactive"}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => handleDelete(c.id)}
                      disabled={busyId === c.id}
                      className="text-gray-400 hover:text-red-600 disabled:opacity-50"
                      aria-label="Delete coupon"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
