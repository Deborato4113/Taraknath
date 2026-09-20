"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CheckCircle2, Clock, XCircle } from "lucide-react";
import Header from "../../../components/Header";
import OrderTimeline from "../../../components/OrderTimeline";

// What to show depends on the order's actual status — this used to show
// "Order Confirmed" unconditionally for any order fetched, including ones
// whose payment never went through (still PENDING). Now it reflects what
// actually happened.
const STATUS_DISPLAY = {
  PENDING: {
    icon: Clock,
    iconClass: "text-amber-500",
    heading: "Payment Pending",
    message: "We haven't received payment confirmation for this order yet. If you completed payment, this can take a few minutes to update — otherwise the payment may not have gone through.",
    totalLabel: "Total Due",
  },
  CANCELLED: {
    icon: XCircle,
    iconClass: "text-red-600",
    heading: "Order Cancelled",
    message: "This order has been cancelled.",
    totalLabel: "Total",
  },
  // PAID, PROCESSING, SHIPPED, DELIVERED all mean payment succeeded —
  // same "confirmed" display for all of them.
  DEFAULT: {
    icon: CheckCircle2,
    iconClass: "text-green-600",
    heading: "Order Confirmed",
    message: null,
    totalLabel: "Total Paid",
  },
};

export default function OrderConfirmationPage({ params }) {
  const [order, setOrder] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`/api/orders/${params.orderId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.error) setError(data.error);
        else setOrder(data);
      })
      .catch(() => setError("Could not load order details."));
  }, [params.orderId]);

  const display = order ? (STATUS_DISPLAY[order.status] || STATUS_DISPLAY.DEFAULT) : null;
  const Icon = display?.icon;

  return (
    <div className="min-h-screen bg-white flex flex-col" style={{ fontFamily: "'Inter', sans-serif" }}>
      <Header />

      <div className="flex-1 max-w-2xl mx-auto w-full px-5 sm:px-8 py-16 text-center">
        {error ? (
          <p className="text-red-600">{error}</p>
        ) : !order ? (
          <p className="text-gray-400 text-sm">Loading order details...</p>
        ) : (
          <>
            <Icon size={48} className={`${display.iconClass} mx-auto mb-4`} />
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 heading-font uppercase mb-2">
              {display.heading}
            </h1>
            <p className="text-gray-500 mb-2">
              Order ID: <span className="font-mono">{order.id}</span>
            </p>
            {display.message && (
              <p className="text-gray-500 text-sm max-w-md mx-auto mb-8">{display.message}</p>
            )}
            {!display.message && <div className="mb-8" />}

            {order.status !== "CANCELLED" && (
              <OrderTimeline status={order.status} createdAt={order.createdAt} updatedAt={order.updatedAt} />
            )}

            <div className="border border-gray-200 text-left mb-8">
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
                <span>{display.totalLabel}</span>
                <span>₹{Number(order.total).toLocaleString("en-IN")}</span>
              </div>
            </div>

            <div className="flex items-center justify-center gap-4 flex-wrap">
              {order.status === "PENDING" && (
                <Link
                  href="/checkout"
                  className="inline-flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 transition-colors text-white text-xs font-semibold tracking-widest uppercase px-7 py-4"
                >
                  Try Payment Again
                </Link>
              )}
              <Link
                href="/"
                className="inline-flex items-center justify-center gap-2 bg-gray-900 hover:bg-red-600 transition-colors text-white text-xs font-semibold tracking-widest uppercase px-7 py-4"
              >
                Back to Home
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
