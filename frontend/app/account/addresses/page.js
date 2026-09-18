"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Pencil, Trash2, Plus } from "lucide-react";

const emptyAddress = {
  label: "", line1: "", line2: "", city: "", state: "", pincode: "", phone: "", country: "India",
};

export default function AddressesPage() {
  const { status } = useSession();
  const router = useRouter();

  const [addresses, setAddresses] = useState(null);
  const [error, setError] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState(null); // null = adding new
  const [form, setForm] = useState(emptyAddress);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    const res = await fetch("/api/addresses");
    const data = await res.json();
    if (!res.ok) return setError(data.error || "Failed to load addresses");
    setAddresses(data);
  }

  function openAddForm() {
    setForm(emptyAddress);
    setEditingId(null);
    setFormOpen(true);
  }

  function openEditForm(addr) {
    setForm({
      label: addr.label || "", line1: addr.line1, line2: addr.line2 || "",
      city: addr.city, state: addr.state, pincode: addr.pincode,
      phone: addr.phone, country: addr.country,
    });
    setEditingId(addr.id);
    setFormOpen(true);
  }

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSaving(true);

    const res = await fetch(editingId ? `/api/addresses/${editingId}` : "/api/addresses", {
      method: editingId ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    setSaving(false);

    if (!res.ok) {
      setError(data.error || "Failed to save address");
      return;
    }

    setFormOpen(false);
    load();
  }

  async function handleDelete(id) {
    if (!confirm("Delete this address?")) return;
    setDeletingId(id);
    const res = await fetch(`/api/addresses/${id}`, { method: "DELETE" });
    setDeletingId(null);
    if (!res.ok) {
      const data = await res.json();
      alert(data.error || "Failed to delete address");
      return;
    }
    setAddresses((prev) => prev.filter((a) => a.id !== id));
  }

  const inputClass = "w-full border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:border-blue-800";

  return (
    <div className="min-h-screen bg-white flex flex-col" style={{ fontFamily: "'Inter', sans-serif" }}>
      <div className="bg-gray-900 text-white">
        <div className="max-w-2xl mx-auto px-5 sm:px-8 py-4 flex justify-center">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-8 h-8 relative flex-shrink-0">
              <Image src="/logo.png" alt="Taraknath Engineering Works logo" fill sizes="32px" className="object-contain" />
            </div>
            <span className="text-xs font-bold tracking-widest uppercase heading-font">
              Taraknath Engineering Works
            </span>
          </Link>
        </div>
      </div>
      <div className="h-1 w-full bg-blue-800" />

      <div className="flex-1 max-w-2xl mx-auto w-full px-5 sm:px-8 py-16">
        <p className="mono text-[11px] font-semibold tracking-[0.3em] text-red-600 uppercase mb-2 text-center">
          Account
        </p>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 heading-font uppercase mb-8 text-center">
          Saved Addresses
        </h1>

        {error && <p className="text-sm text-red-600 text-center mb-4">{error}</p>}

        {!formOpen && (
          <button
            onClick={openAddForm}
            className="mb-6 inline-flex items-center gap-2 bg-gray-900 hover:bg-red-600 transition-colors text-white text-xs font-semibold tracking-widest uppercase px-6 py-3"
          >
            <Plus size={14} /> Add New Address
          </button>
        )}

        {formOpen && (
          <form onSubmit={handleSubmit} className="border border-gray-200 p-5 mb-6 flex flex-col gap-3">
            <p className="mono text-[10px] font-semibold tracking-widest uppercase text-gray-500 mb-1">
              {editingId ? "Edit Address" : "New Address"}
            </p>
            <input
              placeholder="Label (e.g. Home, Office) — optional"
              value={form.label}
              onChange={(e) => update("label", e.target.value)}
              className={inputClass}
            />
            <input
              required
              placeholder="Address line 1"
              value={form.line1}
              onChange={(e) => update("line1", e.target.value)}
              className={inputClass}
            />
            <input
              placeholder="Address line 2 (optional)"
              value={form.line2}
              onChange={(e) => update("line2", e.target.value)}
              className={inputClass}
            />
            <div className="grid grid-cols-2 gap-3">
              <input required placeholder="City" value={form.city} onChange={(e) => update("city", e.target.value)} className={inputClass} />
              <input required placeholder="State" value={form.state} onChange={(e) => update("state", e.target.value)} className={inputClass} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <input required placeholder="Pincode" value={form.pincode} onChange={(e) => update("pincode", e.target.value)} className={inputClass} />
              <input required type="tel" placeholder="Phone number" value={form.phone} onChange={(e) => update("phone", e.target.value)} className={inputClass} />
            </div>
            <input placeholder="Country" value={form.country} onChange={(e) => update("country", e.target.value)} className={inputClass} />

            <div className="flex gap-3 mt-2">
              <button
                type="submit"
                disabled={saving}
                className="bg-red-600 hover:bg-red-700 disabled:opacity-60 text-white text-xs font-semibold tracking-widest uppercase px-6 py-3 transition-colors"
              >
                {saving ? "Saving…" : "Save Address"}
              </button>
              <button
                type="button"
                onClick={() => setFormOpen(false)}
                className="text-xs font-semibold tracking-widest uppercase text-gray-500 px-6 py-3"
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        {!addresses ? (
          <p className="text-sm text-gray-400 text-center">Loading…</p>
        ) : addresses.length === 0 ? (
          <p className="text-sm text-gray-500 text-center">No saved addresses yet.</p>
        ) : (
          <div className="flex flex-col gap-3">
            {addresses.map((addr) => (
              <div key={addr.id} className="border border-gray-200 px-4 py-4 flex items-start justify-between gap-4">
                <div className="text-sm text-gray-700 leading-relaxed">
                  {addr.label && <p className="font-semibold text-gray-900 mb-0.5">{addr.label}</p>}
                  <p>
                    {addr.line1}{addr.line2 ? `, ${addr.line2}` : ""}
                    <br />
                    {addr.city}, {addr.state} {addr.pincode}
                    <br />
                    {addr.country} · {addr.phone}
                  </p>
                </div>
                <div className="flex gap-3 flex-shrink-0">
                  <button onClick={() => openEditForm(addr)} className="text-blue-800 hover:text-blue-900" aria-label="Edit">
                    <Pencil size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(addr.id)}
                    disabled={deletingId === addr.id}
                    className="text-red-600 hover:text-red-700 disabled:opacity-50"
                    aria-label="Delete"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
