import React from "react";
import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { money } from "../utils/format";
import "./CartDropdown.css";

export default function CartDropdown() {
  const { items, open, setOpen, removeFromCart, total, count } = useCart();

  if (!open) return null;

  const close = () => setOpen(false);

  return (
    <div className="cart-dropdown">
      <div className="cart-dropdown-head">
        <strong>Your Cart ({count})</strong>
        <button type="button" onClick={close} aria-label="Close cart">
          ×
        </button>
      </div>

      {items.length === 0 ? (
        <p className="cart-dropdown-empty">Your cart is empty.</p>
      ) : (
        <>
          <ul className="cart-dropdown-list">
            {items.map((item) => (
              <li key={item.key} className="cart-dropdown-item">
                <img src={item.image} alt={item.title} />
                <div className="cart-item-info">
                  <span className="cart-item-title">{item.title}</span>
                  <span className="cart-item-meta">
                    {item.size} × {item.qty}
                  </span>
                </div>
                <span className="cart-item-price">
                  {money(item.price * item.qty)}
                </span>
                <button
                  type="button"
                  className="cart-item-remove"
                  onClick={() => removeFromCart(item.key)}
                  aria-label={`Remove ${item.title}`}
                >
                  ×
                </button>
              </li>
            ))}
          </ul>

          <div className="cart-dropdown-foot">
            <div className="cart-dropdown-total">
              <span>Estimated Total</span>
              <strong>{money(total)}</strong>
            </div>
            <p className="cart-dropdown-shipping">Shipping is free.</p>
            <Link to="/checkout" className="btn-primary" onClick={close}>
              Proceed to Checkout
            </Link>
            <Link to="/cart" className="btn-ghost" onClick={close}>
              View Full Cart
            </Link>
          </div>
        </>
      )}
    </div>
  );
}