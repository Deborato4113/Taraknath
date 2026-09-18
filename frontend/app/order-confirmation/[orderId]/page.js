"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { CheckCircle2 } from "lucide-react";

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

      <div className="flex-1 max-w-2xl mx-auto w-full px-5 sm:px-8 py-16 text-center">
        {error ? (
          <p className="text-red-600">{error}</p>
        ) : !order ? (
          <p className="text-gray-400 text-sm">Loading order details...</p>
        ) : (
          <>
            <CheckCircle2 size={48} className="text-green-600 mx-auto mb-4" />
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 heading-font uppercase mb-2">
              Order Confirmed
            </h1>
            <p className="text-gray-500 mb-8">
              Order ID: <span className="font-mono">{order.id}</span>
            </p>

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
              <div className="flex justify-between items-center px-4 py-3 bg-gray-50 text-sm font-bold">
                <span>Total Paid</span>
                <span>₹{Number(order.total).toLocaleString("en-IN")}</span>
              </div>
            </div>

            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 bg-gray-900 hover:bg-red-600 transition-colors text-white text-xs font-semibold tracking-widest uppercase px-7 py-4"
            >
              Back to Home
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
