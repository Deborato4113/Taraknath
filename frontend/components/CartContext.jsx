"use client";

import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const { status } = useSession();
  const [cart, setCart] = useState({ items: [], subtotal: 0 });
  const [loading, setLoading] = useState(false);

  const refreshCart = useCallback(async () => {
    if (status !== "authenticated") {
      setCart({ items: [], subtotal: 0 });
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/cart");
      if (res.ok) setCart(await res.json());
    } finally {
      setLoading(false);
    }
  }, [status]);

  useEffect(() => {
    refreshCart();
  }, [refreshCart]);

  async function addToCart(productId, quantity = 1) {
    const res = await fetch("/api/cart", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId, quantity }),
    });
    const data = await res.json();
    if (res.ok) setCart(data);
    return { ok: res.ok, error: data?.error };
  }

  async function updateQuantity(itemId, quantity) {
    const res = await fetch(`/api/cart/${itemId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ quantity }),
    });
    const data = await res.json();
    if (res.ok) setCart(data);
    return { ok: res.ok, error: data?.error };
  }

  async function removeItem(itemId) {
    const res = await fetch(`/api/cart/${itemId}`, { method: "DELETE" });
    const data = await res.json();
    if (res.ok) setCart(data);
    return { ok: res.ok, error: data?.error };
  }

  const itemCount = cart.items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{ cart, loading, itemCount, refreshCart, addToCart, updateQuantity, removeItem }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside <CartProvider>");
  return ctx;
}
