"use client";

import { useState } from "react";
import Script from "next/script";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft } from "lucide-react";
import { useCart } from "../../components/CartContext";
import Header from "../../components/Header";

export default function CheckoutPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { cart, loading, refreshCart } = useCart();

  const [address, setAddress] = useState({
    line1: "",
    line2: "",
    city: "",
    state: "",
    pincode: "",
    phone: "",
  });
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState("");

  if (status === "unauthenticated") {
    router.push("/login?callbackUrl=%2Fcheckout");
    return null;
  }

  function updateField(field, value) {
    setAddress((prev) => ({ ...prev, [field]: value }));
  }

  async function handlePlaceOrder(e) {
    e.preventDefault();
    setError("");
    setPlacing(true);

    try {
      // 1. Create the order on our server — this locks in the price from
      // the database and creates a matching Razorpay order.
      const createRes = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address }),
      });
      const orderData = await createRes.json();

      if (!createRes.ok) {
        setError(orderData.error || "Could not create your order. Please try again.");
        setPlacing(false);
        return;
      }

      // 2. Open Razorpay's hosted checkout popup with that order.
      const options = {
        key: orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "Taraknath Engineering Works",
        description: "Order payment",
        order_id: orderData.razorpayOrderId,
        prefill: {
          name: session?.user?.name || "",
          email: session?.user?.email || "",
          contact: address.phone,
        },
        theme: { color: "#dc2626" },
        handler: async function (response) {
          // 3. Payment succeeded in the popup — verify it server-side
          // before treating the order as actually paid.
          const verifyRes = await fetch("/api/orders/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              orderId: orderData.orderId,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            }),
          });
          const verifyData = await verifyRes.json();

          if (verifyRes.ok) {
            await refreshCart(); // cart was cleared server-side, sync local state
            router.push(`/order-confirmation/${orderData.orderId}`);
          } else {
            setError(verifyData.error || "Payment verification failed. Please contact us if you were charged.");
            setPlacing(false);
          }
        },
        modal: {
          ondismiss: function () {
            // User closed the popup without paying — the order stays PENDING
            // in the database; nothing further to do here.
            setPlacing(false);
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      setError("Something went wrong. Please try again.");
      setPlacing(false);
    }
  }

  return (
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />

      <div className="min-h-screen bg-white flex flex-col" style={{ fontFamily: "'Inter', sans-serif" }}>
        <Header />
        <div className="max-w-4xl mx-auto px-5 sm:px-8 py-3">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 text-xs font-semibold tracking-widest uppercase text-gray-500 hover:text-red-600 transition-colors"
          >
            <ArrowLeft size={14} /> Back
          </button>
        </div>

        <div className="flex-1 max-w-2xl mx-auto w-full px-5 sm:px-8 py-10 sm:py-14">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 heading-font uppercase mb-8">
            Checkout
          </h1>

          {loading ? (
            <p className="text-gray-400 text-sm">Loading...</p>
          ) : cart.items.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-gray-500 mb-4">Your cart is empty.</p>
              <Link href="/#products" className="text-blue-800 font-semibold text-sm hover:underline">
                Browse products
              </Link>
            </div>
          ) : (
            <>
              {/* Order summary */}
              <div className="border border-gray-200 mb-8">
                {cart.items.map((line) => (
                  <div
                    key={line.id}
                    className="flex justify-between items-center px-4 py-3 text-sm border-b border-gray-100 last:border-0"
                  >
                    <span className="text-gray-700">
                      {line.product.name} <span className="text-gray-400">× {line.quantity}</span>
                    </span>
                    <span className="font-semibold text-gray-900">
                      ₹{(Number(line.product.price) * line.quantity).toLocaleString("en-IN")}
                    </span>
                  </div>
                ))}
                <div className="flex justify-between items-center px-4 py-3 bg-gray-50 text-sm font-bold">
                  <span>Total</span>
                  <span>₹{Number(cart.subtotal).toLocaleString("en-IN")}</span>
                </div>
              </div>

              {/* Shipping address form */}
              <form onSubmit={handlePlaceOrder} className="flex flex-col gap-4">
                <p className="mono text-[11px] font-semibold tracking-[0.3em] text-red-600 uppercase">
                  Shipping Address
                </p>

                <input
                  required
                  placeholder="Address line 1"
                  value={address.line1}
                  onChange={(e) => updateField("line1", e.target.value)}
                  className="w-full border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:border-blue-800"
                />
                <input
                  placeholder="Address line 2 (optional)"
                  value={address.line2}
                  onChange={(e) => updateField("line2", e.target.value)}
                  className="w-full border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:border-blue-800"
                />
                <div className="grid grid-cols-2 gap-4">
                  <input
                    required
                    placeholder="City"
                    value={address.city}
                    onChange={(e) => updateField("city", e.target.value)}
                    className="w-full border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:border-blue-800"
                  />
                  <input
                    required
                    placeholder="State"
                    value={address.state}
                    onChange={(e) => updateField("state", e.target.value)}
                    className="w-full border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:border-blue-800"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <input
                    required
                    placeholder="Pincode"
                    value={address.pincode}
                    onChange={(e) => updateField("pincode", e.target.value)}
                    className="w-full border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:border-blue-800"
                  />
                  <input
                    required
                    type="tel"
                    placeholder="Phone number"
                    value={address.phone}
                    onChange={(e) => updateField("phone", e.target.value)}
                    className="w-full border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:border-blue-800"
                  />
                </div>

                {error && <p className="text-red-600 text-sm">{error}</p>}

                <button
                  type="submit"
                  disabled={placing}
                  className="mt-2 inline-flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 disabled:opacity-60 transition-colors text-white text-xs font-semibold tracking-widest uppercase px-7 py-4"
                >
                  {placing ? "Processing..." : `Pay ₹${Number(cart.subtotal).toLocaleString("en-IN")}`}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </>
  );
}
