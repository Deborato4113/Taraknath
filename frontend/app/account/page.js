"use client";

import { useEffect, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import Header from "../../components/Header";

export default function AccountPage() {
  const { status } = useSession();
  const router = useRouter();

  const [user, setUser] = useState(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  useEffect(() => {
    fetch("/api/account")
      .then((res) => res.json())
      .then((data) => {
        if (data.error) return setError(data.error);
        setUser(data);
        setName(data.name || "");
        setPhone(data.phone || "");
      });
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSaved(false);
    setSaving(true);

    const res = await fetch("/api/account", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, phone }),
    });
    const data = await res.json();
    setSaving(false);

    if (!res.ok) {
      setError(data.error || "Failed to save changes");
      return;
    }
    setUser(data);
    setSaved(true);
  }

  const labelClass = "block mono text-[10px] font-semibold tracking-widest uppercase text-gray-500 mb-1.5";
  const inputClass = "w-full border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:border-blue-800";

  return (
    <div className="min-h-screen bg-white flex flex-col" style={{ fontFamily: "'Inter', sans-serif" }}>
      <Header />

      <div className="flex-1 flex items-center justify-center px-5 py-16">
        <div className="w-full max-w-md">
          <p className="mono text-[11px] font-semibold tracking-[0.3em] text-red-600 uppercase mb-2 text-center">
            Account
          </p>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 heading-font uppercase mb-2 text-center">
            My Account
          </h1>
          <p className="text-center text-sm text-gray-500 mb-8">
            <Link href="/account/orders" className="text-blue-800 hover:underline">
              View order history
            </Link>
            {" · "}
            <Link href="/account/addresses" className="text-blue-800 hover:underline">
              Manage addresses
            </Link>
          </p>

          {!user ? (
            <p className="text-sm text-gray-400 text-center">Loading…</p>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div>
                <label className={labelClass}>Email</label>
                <input className={`${inputClass} bg-gray-50 text-gray-500`} value={user.email} disabled />
              </div>
              <div>
                <label className={labelClass}>Name</label>
                <input className={inputClass} value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div>
                <label className={labelClass}>Phone</label>
                <input className={inputClass} value={phone} onChange={(e) => setPhone(e.target.value)} />
              </div>

              {error && <p className="text-sm text-red-600">{error}</p>}
              {saved && <p className="text-sm text-green-600">Saved.</p>}

              <button
                type="submit"
                disabled={saving}
                className="mt-2 bg-red-600 hover:bg-red-700 disabled:opacity-60 text-white text-xs font-semibold tracking-widest uppercase px-7 py-3.5 transition-colors"
              >
                {saving ? "Saving…" : "Save Changes"}
              </button>
            </form>
          )}

          <div className="mt-10 pt-6 border-t border-gray-200 text-center">
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="text-xs font-semibold tracking-widest uppercase text-gray-500 hover:text-red-600 transition-colors"
            >
              Log Out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
