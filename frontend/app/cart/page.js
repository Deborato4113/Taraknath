"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Trash2, Minus, Plus, ArrowLeft } from "lucide-react";
import { useCart } from "../../components/CartContext";
import Footer from "../../components/Footer";
import Header from "../../components/Header";

export default function CartPage() {
  const { status } = useSession();
  const router = useRouter();
  const { cart, loading, refreshCart, updateQuantity, removeItem } = useCart();

  // Safety-net refetch: the shared CartContext already updates itself the
  // moment an item is added elsewhere in the app, but this guarantees the
  // cart page always shows current data the instant it's opened, no matter
  // how you navigated here (client-side link vs. a hard refresh/typed URL).
  useEffect(() => {
    if (status === "authenticated") refreshCart();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  if (status === "unauthenticated") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-5 text-center">
        <p className="text-gray-500 mb-4">Log in to view your cart.</p>
        <Link
          href="/login?callbackUrl=%2Fcart"
          className="bg-red-600 hover:bg-red-700 text-white text-xs font-semibold tracking-widest uppercase px-6 py-3"
        >
          Log In
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col" style={{ fontFamily: "'Inter', sans-serif" }}>
      <Header />

      <div className="flex-1 max-w-4xl mx-auto w-full px-5 sm:px-8 py-10 sm:py-14">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 heading-font uppercase mb-8">
          Your Cart
        </h1>

        {loading ? (
          <p className="text-gray-400 text-sm">Loading cart...</p>
        ) : cart.items.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-500 mb-4">Your cart is empty.</p>
            <Link
              href="/#products"
              className="text-blue-800 font-semibold text-sm hover:underline"
            >
              Browse products
            </Link>
          </div>
        ) : (
          <>
            <div className="flex flex-col divide-y divide-gray-200 border border-gray-200 mb-8">
              {cart.items.map((line) => (
                <div key={line.id} className="flex gap-4 sm:gap-6 p-4 sm:p-6">
                  <div className="w-[80px] h-[80px] sm:w-[100px] sm:h-[100px] flex-shrink-0 bg-gray-100 border border-gray-200 relative overflow-hidden">
                    {line.product.image ? (
                      <Image
                        src={line.product.image}
                        alt={line.product.name}
                        fill
                        sizes="100px"
                        className="object-contain p-2"
                      />
                    ) : null}
                  </div>

                  <div className="flex flex-col flex-1 min-w-0">
                    <p className="font-bold text-gray-900 text-sm sm:text-base heading-font uppercase mb-1">
                      {line.product.name}
                    </p>
                    <p className="text-gray-500 text-sm mb-3">
                      ₹{Number(line.product.price).toLocaleString("en-IN")} each
                    </p>

                    <div className="mt-auto flex items-center justify-between gap-4">
                      <div className="flex items-center border border-gray-300">
                        <button
                          onClick={() => updateQuantity(line.id, Math.max(1, line.quantity - 1))}
                          className="w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-gray-100"
                          aria-label="Decrease quantity"
                        >
                          <Minus size={13} />
                        </button>
                        <span className="w-9 text-center text-sm font-semibold">{line.quantity}</span>
                        <button
                          onClick={() => updateQuantity(line.id, line.quantity + 1)}
                          className="w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-gray-100"
                          aria-label="Increase quantity"
                        >
                          <Plus size={13} />
                        </button>
                      </div>

                      <button
                        onClick={() => removeItem(line.id)}
                        className="text-gray-400 hover:text-red-600 transition-colors"
                        aria-label="Remove item"
                      >
                        <Trash2 size={17} />
                      </button>
                    </div>
                  </div>

                  <p className="hidden sm:block font-bold text-gray-900 text-sm w-24 text-right flex-shrink-0">
                    ₹{(Number(line.product.price) * line.quantity).toLocaleString("en-IN")}
                  </p>
                </div>
              ))}
            </div>

            <div className="flex justify-end">
              <div className="w-full sm:w-72">
                <div className="flex justify-between text-sm text-gray-600 mb-2">
                  <span>Subtotal</span>
                  <span className="font-semibold text-gray-900">
                    ₹{Number(cart.subtotal).toLocaleString("en-IN")}
                  </span>
                </div>
                <p className="text-xs text-gray-400 mb-4">Shipping and taxes calculated at checkout.</p>
                <Link
                  href="/checkout"
                  className="w-full inline-flex items-center justify-center bg-red-600 hover:bg-red-700 transition-colors text-white text-xs font-semibold tracking-widest uppercase px-6 py-4"
                >
                  Proceed to Checkout
                </Link>
              </div>
            </div>
          </>
        )}
      </div>

      <Footer />
    </div>
  );
}
