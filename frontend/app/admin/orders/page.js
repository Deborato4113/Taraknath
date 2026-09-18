"use client";

import { useEffect, useState } from "react";

const STATUSES = ["PENDING", "PAID", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"];

const STATUS_COLORS = {
  PENDING: "bg-gray-100 text-gray-600",
  PAID: "bg-blue-100 text-blue-700",
  PROCESSING: "bg-yellow-100 text-yellow-700",
  SHIPPED: "bg-purple-100 text-purple-700",
  DELIVERED: "bg-green-100 text-green-700",
  CANCELLED: "bg-red-100 text-red-700",
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState(null);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState(null);
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    const res = await fetch("/api/admin/orders");
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Failed to load orders");
      return;
    }
    setOrders(data);
  }

  async function handleStatusChange(orderId, status) {
    setUpdatingId(orderId);
    const res = await fetch(`/api/admin/orders/${orderId}/status`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    const data = await res.json();
    setUpdatingId(null);

    if (!res.ok) {
      alert(data.error || "Failed to update status");
      return;
    }
    setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status } : o)));
  }

  return (
    <div>
      <p className="mono text-[11px] font-semibold tracking-[0.3em] text-red-600 uppercase mb-2">
        Sales
      </p>
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 heading-font uppercase mb-8">
        Orders
      </h1>

      {error && <p className="text-sm text-red-600 mb-4">{error}</p>}

      {!orders ? (
        <p className="text-sm text-gray-500">Loading…</p>
      ) : orders.length === 0 ? (
        <p className="text-sm text-gray-500">No orders yet.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {orders.map((order) => (
            <div key={order.id} className="bg-white border border-gray-200">
              <div className="flex items-center justify-between px-4 py-3 flex-wrap gap-3">
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setExpandedId(expandedId === order.id ? null : order.id)}
                    className="text-xs font-semibold text-blue-800 hover:underline"
                  >
                    {expandedId === order.id ? "Hide" : "Details"}
                  </button>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">
                      {order.user?.name || order.user?.email}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(order.createdAt).toLocaleString("en-IN")} · {order.items.length} item(s)
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <span className="text-sm font-bold text-gray-900">
                    ₹{Number(order.total).toLocaleString("en-IN")}
                  </span>
                  <span
                    className={`inline-block px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${STATUS_COLORS[order.status] || ""}`}
                  >
                    {order.status}
                  </span>
                  <select
                    value={order.status}
                    disabled={updatingId === order.id}
                    onChange={(e) => handleStatusChange(order.id, e.target.value)}
                    className="border border-gray-300 text-xs px-2 py-1.5 focus:outline-none focus:border-blue-800 disabled:opacity-50"
                  >
                    {STATUSES.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>

              {expandedId === order.id && (
                <div className="border-t border-gray-100 px-4 py-4 bg-gray-50 text-sm">
                  <div className="grid sm:grid-cols-2 gap-6">
                    <div>
                      <p className="mono text-[10px] font-semibold tracking-widest uppercase text-gray-500 mb-2">
                        Items
                      </p>
                      <ul className="flex flex-col gap-1">
                        {order.items.map((item) => (
                          <li key={item.id} className="flex justify-between text-gray-700">
                            <span>
                              {item.product?.name} <span className="text-gray-400">× {item.quantity}</span>
                            </span>
                            <span>₹{Number(item.price).toLocaleString("en-IN")}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <p className="mono text-[10px] font-semibold tracking-widest uppercase text-gray-500 mb-2">
                        Shipping Address
                      </p>
                      {order.address ? (
                        <p className="text-gray-700 leading-relaxed">
                          {order.address.line1}
                          {order.address.line2 ? `, ${order.address.line2}` : ""}
                          <br />
                          {order.address.city}, {order.address.state} {order.address.pincode}
                          <br />
                          {order.address.country} · {order.address.phone}
                        </p>
                      ) : (
                        <p className="text-gray-400">No address on file</p>
                      )}
                      <p className="mono text-[10px] font-semibold tracking-widest uppercase text-gray-500 mt-4 mb-1">
                        Contact
                      </p>
                      <p className="text-gray-700">{order.user?.email}</p>
                      {order.payment && (
                        <>
                          <p className="mono text-[10px] font-semibold tracking-widest uppercase text-gray-500 mt-4 mb-1">
                            Payment
                          </p>
                          <p className="text-gray-700">
                            {order.payment.status} · {order.payment.razorpayPaymentId || "—"}
                          </p>
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
