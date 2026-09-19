"use client";

import { useEffect, useState } from "react";

const STATUSES = ["NEW", "CONTACTED", "CLOSED"];

const STATUS_COLORS = {
  NEW: "bg-blue-100 text-blue-700",
  CONTACTED: "bg-yellow-100 text-yellow-700",
  CLOSED: "bg-gray-100 text-gray-600",
};

export default function AdminQuoteRequestsPage() {
  const [quotes, setQuotes] = useState(null);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState(null);
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    const res = await fetch("/api/admin/quote-requests");
    const data = await res.json();
    if (!res.ok) return setError(data.error || "Failed to load quote requests");
    setQuotes(data);
  }

  async function handleStatusChange(id, status) {
    setUpdatingId(id);
    const res = await fetch(`/api/admin/quote-requests/${id}/status`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    setUpdatingId(null);
    if (res.ok) setQuotes((prev) => prev.map((q) => (q.id === id ? { ...q, status } : q)));
  }

  return (
    <div>
      <p className="mono text-[11px] font-semibold tracking-[0.3em] text-red-600 uppercase mb-2">
        Bulk Orders
      </p>
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 heading-font uppercase mb-8">
        Quote Requests
      </h1>

      {error && <p className="text-sm text-red-600 mb-4">{error}</p>}

      {!quotes ? (
        <p className="text-sm text-gray-500">Loading…</p>
      ) : quotes.length === 0 ? (
        <p className="text-sm text-gray-500">No quote requests yet.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {quotes.map((q) => (
            <div key={q.id} className="bg-white border border-gray-200">
              <div className="flex items-center justify-between px-4 py-3 flex-wrap gap-3">
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setExpandedId(expandedId === q.id ? null : q.id)}
                    className="text-xs font-semibold text-blue-800 hover:underline"
                  >
                    {expandedId === q.id ? "Hide" : "Details"}
                  </button>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">
                      {q.user?.name || q.user?.email}
                      {q.projectRef && <span className="text-gray-400 font-normal"> · {q.projectRef}</span>}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(q.createdAt).toLocaleString("en-IN")} · {q.items.length} item(s)
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className={`inline-block px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${STATUS_COLORS[q.status] || ""}`}>
                    {q.status}
                  </span>
                  <select
                    value={q.status}
                    disabled={updatingId === q.id}
                    onChange={(e) => handleStatusChange(q.id, e.target.value)}
                    className="border border-gray-300 text-xs px-2 py-1.5 focus:outline-none focus:border-blue-800 disabled:opacity-50"
                  >
                    {STATUSES.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>

              {expandedId === q.id && (
                <div className="border-t border-gray-100 px-4 py-4 bg-gray-50 text-sm">
                  <div className="grid sm:grid-cols-2 gap-6">
                    <div>
                      <p className="mono text-[10px] font-semibold tracking-widest uppercase text-gray-500 mb-2">
                        Items
                      </p>
                      <ul className="flex flex-col gap-1">
                        {q.items.map((item) => (
                          <li key={item.id} className="text-gray-700">
                            {item.product?.name} <span className="text-gray-400">× {item.quantity}</span>
                            {item.note && <span className="text-gray-400"> — {item.note}</span>}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <p className="mono text-[10px] font-semibold tracking-widest uppercase text-gray-500 mb-2">
                        Contact
                      </p>
                      <p className="text-gray-700">{q.user?.email}</p>
                      {q.user?.phone && <p className="text-gray-700">{q.user.phone}</p>}
                      {q.message && (
                        <>
                          <p className="mono text-[10px] font-semibold tracking-widest uppercase text-gray-500 mt-4 mb-1">
                            Message
                          </p>
                          <p className="text-gray-700 whitespace-pre-wrap">{q.message}</p>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
