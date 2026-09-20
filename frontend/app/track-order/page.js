"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import OrderTimeline from "../../components/OrderTimeline";

export default function TrackOrderPage() {
  const [orderId, setOrderId] = useState("");
  const [contact, setContact] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [order, setOrder] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setOrder(null);
    setLoading(true);

    try {
      const res = await fetch("/api/orders/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: orderId.trim(), contact: contact.trim() }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Couldn't find that order.");
      } else {
        setOrder(data);
      }
    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-white flex flex-col" style={{ fontFamily: "'Inter', sans-serif" }}>
      <Header />

      <div className="flex-1 max-w-2xl mx-auto w-full px-5 sm:px-8 py-14 sm:py-16">
        <p className="mono text-[11px] font-semibold tracking-[0.3em] text-red-600 uppercase mb-2">
          Order Status
        </p>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 heading-font uppercase mb-2">
          Track Your Order
        </h1>
        <p className="text-gray-500 text-sm mb-8">
          Enter your Order ID and the email or phone number used at checkout to check its status —
          no login needed.
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 mb-10">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Order ID</label>
            <input
              required
              placeholder="e.g. cme1a2b3c4d5..."
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
              className="w-full border border-gray-300 px-4 py-3 text-sm font-mono focus:outline-none focus:border-blue-800"
            />
            <p className="text-xs text-gray-400 mt-1">
              Find this in your order confirmation email, or under "My Orders" if you're logged in.
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Email or Phone Number</label>
            <input
              required
              placeholder="you@example.com or 98765xxxxx"
              value={contact}
              onChange={(e) => setContact(e.target.value)}
              className="w-full border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:border-blue-800"
            />
          </div>

          {error && <p className="text-red-600 text-sm">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="mt-1 inline-flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 disabled:opacity-60 transition-colors text-white text-xs font-semibold tracking-widest uppercase px-7 py-4"
          >
            <Search size={15} />
            {loading ? "Looking up..." : "Track Order"}
          </button>
        </form>

        {order && (
          <div className="border-t border-gray-200 pt-8">
            <p className="text-gray-500 mb-2">
              Order ID: <span className="font-mono">{order.id}</span>
            </p>
            <p className="text-gray-500 text-sm mb-6">
              Placed on {new Date(order.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
              {order.shippingCity && ` · Shipping to ${order.shippingCity}, ${order.shippingState}`}
            </p>

            {order.status !== "CANCELLED" ? (
              <OrderTimeline status={order.status} createdAt={order.createdAt} updatedAt={order.updatedAt} />
            ) : (
              <div className="border border-red-200 bg-red-50 px-4 py-3 mb-8">
                <p className="text-sm font-semibold text-red-700">This order was cancelled.</p>
              </div>
            )}

            <div className="border border-gray-200 text-left">
              {order.items.map((item) => (
                <div
                  key={item.id}
                  className="flex justify-between items-center px-4 py-3 text-sm border-b border-gray-100 last:border-0"
                >
                  <span className="text-gray-700">
                    {item.product.name} <span className="text-gray-400">× {item.quantity}</span>
                  </span>
                  <span className="font-semibold text-gray-900">
                    ₹{(Number(item.price) * item.quantity).toLocaleString("en-IN")}
                  </span>
                </div>
              ))}
              {Number(order.discount) > 0 && (
                <>
                  <div className="flex justify-between items-center px-4 py-2 text-sm border-t border-gray-100">
                    <span className="text-gray-500">Subtotal</span>
                    <span className="text-gray-700">₹{Number(order.subtotal).toLocaleString("en-IN")}</span>
                  </div>
                  <div className="flex justify-between items-center px-4 py-2 text-sm">
                    <span className="text-green-700">
                      Discount{order.coupon ? ` (${order.coupon.code})` : ""}
                    </span>
                    <span className="text-green-700">−₹{Number(order.discount).toLocaleString("en-IN")}</span>
                  </div>
                </>
              )}
              <div className="flex justify-between items-center px-4 py-3 bg-gray-50 text-sm font-bold">
                <span>Total</span>
                <span>₹{Number(order.total).toLocaleString("en-IN")}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
