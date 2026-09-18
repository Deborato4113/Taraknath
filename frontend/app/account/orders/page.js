"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { RotateCcw } from "lucide-react";
import Header from "../../../components/Header";
import { statusLabel, STATUS_COLORS } from "../../../lib/orderStatus";

export default function OrderHistoryPage() {
  const { status } = useSession();
  const router = useRouter();
  const [orders, setOrders] = useState(null);
  const [error, setError] = useState("");
  const [reorderingId, setReorderingId] = useState(null);
  const [reorderMsg, setReorderMsg] = useState({});

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  useEffect(() => {
    fetch("/api/orders")
      .then((res) => res.json())
      .then((data) => {
        if (data.error) return setError(data.error);
        setOrders(data);
      });
  }, []);

  async function handleReorder(orderId) {
    setReorderingId(orderId);
    setReorderMsg((prev) => ({ ...prev, [orderId]: null }));

    const res = await fetch(`/api/orders/${orderId}/reorder`, { method: "POST" });
    const data = await res.json();
    setReorderingId(null);

    if (!res.ok) {
      setReorderMsg((prev) => ({ ...prev, [orderId]: data.error || "Failed to reorder" }));
      return;
    }

    if (data.addedCount === 0) {
      setReorderMsg((prev) => ({ ...prev, [orderId]: "None of these items are available right now." }));
      return;
    }

    router.push("/cart");
  }

  return (
    <div className="min-h-screen bg-white flex flex-col" style={{ fontFamily: "'Inter', sans-serif" }}>
      <Header />

      <div className="flex-1 max-w-2xl mx-auto w-full px-5 sm:px-8 py-16">
        <p className="mono text-[11px] font-semibold tracking-[0.3em] text-red-600 uppercase mb-2 text-center">
          Account
        </p>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 heading-font uppercase mb-8 text-center">
          My Orders
        </h1>

        {error && <p className="text-sm text-red-600 text-center">{error}</p>}

        {!orders ? (
          <p className="text-sm text-gray-400 text-center">Loading…</p>
        ) : orders.length === 0 ? (
          <div className="text-center">
            <p className="text-sm text-gray-500 mb-6">You haven't placed any orders yet.</p>
            <Link
              href="/#products"
              className="inline-block bg-gray-900 hover:bg-red-600 transition-colors text-white text-xs font-semibold tracking-widest uppercase px-7 py-4"
            >
              Browse Products
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {orders.map((order) => (
              <div key={order.id} className="border border-gray-200 hover:border-blue-800 transition-colors px-4 py-4">
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <Link href={`/order-confirmation/${order.id}`} className="flex-1 min-w-[160px]">
                    <p className="text-sm font-semibold text-gray-900 mono">
                      <span className="text-gray-400 font-normal">Order ID:</span> {order.id}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {new Date(order.createdAt).toLocaleDateString("en-IN", {
                        year: "numeric", month: "short", day: "numeric",
                      })}{" "}
                      · {order.items.length} item(s)
                    </p>
                  </Link>
                  <div className="flex items-center gap-4">
                    <span className="text-sm font-bold text-gray-900">
                      ₹{Number(order.total).toLocaleString("en-IN")}
                    </span>
                    <span
                      className={`inline-block px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${STATUS_COLORS[order.status] || ""}`}
                    >
                      {statusLabel(order.status)}
                    </span>
                    <button
                      onClick={() => handleReorder(order.id)}
                      disabled={reorderingId === order.id}
                      className="flex items-center gap-1.5 text-xs font-semibold text-blue-800 hover:text-blue-900 disabled:opacity-50 whitespace-nowrap"
                    >
                      <RotateCcw size={13} />
                      {reorderingId === order.id ? "Adding…" : "Re-order"}
                    </button>
                  </div>
                </div>
                {reorderMsg[order.id] && (
                  <p className="text-xs text-gray-500 mt-2">{reorderMsg[order.id]}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
