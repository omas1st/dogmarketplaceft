import React, { createContext, useContext, useEffect, useState } from "react";

const CartContext = createContext(null);

export const useCart = () => useContext(CartContext);

const STORAGE_KEY = "dm_cart";

function readCart() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch {
    return [];
  }
}

export function CartProvider({ children }) {
  const [items, setItems] = useState(readCart);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  /* addToCart(product, size, qty, color = "", unitPriceOverride = null)
     - For food products, unitPriceOverride carries the per-size price.
     - For non-food products, we use product.sellingPrice. */
  const addToCart = (product, size, qty, color = "", unitPriceOverride = null) => {
    const quantity = Math.max(1, Number(qty) || 1);
    const chosenSize = size || "One Size";
    const chosenColor = String(color || "").trim();

    const unitPrice =
      unitPriceOverride !== null && unitPriceOverride !== undefined
        ? Number(unitPriceOverride) || 0
        : Number(product.sellingPrice) || 0;

    /* Key identifies a unique (product, size, color) line */
    const key = `${product._id}__${chosenSize}__${chosenColor}`;

    setItems((prev) => {
      const existing = prev.find((item) => item.key === key);
      if (existing) {
        return prev.map((item) =>
          item.key === key ? { ...item, qty: item.qty + quantity } : item
        );
      }
      return [
        ...prev,
        {
          key,
          productId: product._id,
          title: product.title,
          image: product.image,
          price: unitPrice,
          originalPrice: Number(product.originalPrice) || 0,
          size: chosenSize,
          color: chosenColor,
          qty: quantity,
        },
      ];
    });

    setOpen(true);
  };

  const removeFromCart = (key) =>
    setItems((prev) => prev.filter((item) => item.key !== key));

  const updateQty = (key, qty) =>
    setItems((prev) =>
      prev.map((item) =>
        item.key === key ? { ...item, qty: Math.max(1, Number(qty) || 1) } : item
      )
    );

  const clearCart = () => setItems([]);

  const total = items.reduce((sum, item) => sum + item.price * item.qty, 0);
  const count = items.reduce((sum, item) => sum + item.qty, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        open,
        setOpen,
        addToCart,
        removeFromCart,
        updateQty,
        clearCart,
        total,
        count,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}