import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { money } from "../utils/format";
import "./Cart.css";

export default function Cart() {
  const { items, updateQty, removeFromCart, total, count, clearCart } = useCart();
  const navigate = useNavigate();

  if (!items.length) {
    return (
      <div className="cart-page">
        <h1>Your Cart</h1>
        <p className="empty-state">Your cart is currently empty.</p>
        <Link to="/" className="btn-primary">
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <h1>Your Cart ({count})</h1>

      <div className="cart-layout">
        <ul className="cart-list">
          {items.map((item) => (
            <li key={item.key} className="cart-row">
              <img src={item.image} alt={item.title} className="cart-row-image" />

              <div className="cart-row-info">
                <Link to={`/product/${item.productId}`} className="cart-row-title">
                  {item.title}
                </Link>
                <span className="cart-row-meta">Size: {item.size}</span>
                <span className="cart-row-meta">
                  Unit price: {money(item.price)}
                </span>
              </div>

              <div className="cart-row-qty">
                <label>
                  Qty
                  <select
                    value={item.qty}
                    onChange={(event) =>
                      updateQty(item.key, Number(event.target.value))
                    }
                  >
                    {Array.from({ length: 10 }, (_, index) => index + 1).map(
                      (num) => (
                        <option key={num} value={num}>
                          {num}
                        </option>
                      )
                    )}
                  </select>
                </label>
              </div>

              <span className="cart-row-total">
                {money(item.price * item.qty)}
              </span>

              <button
                type="button"
                className="cart-row-remove"
                onClick={() => removeFromCart(item.key)}
              >
                Remove
              </button>
            </li>
          ))}
        </ul>

        <aside className="cart-summary">
          <h2>Order Summary</h2>

          <div className="summary-line">
            <span>Subtotal</span>
            <span>{money(total)}</span>
          </div>

          <div className="summary-line">
            <span>Shipping</span>
            <span>Free</span>
          </div>

          <div className="summary-line total">
            <span>Estimated Total</span>
            <strong>{money(total)}</strong>
          </div>

          <button
            type="button"
            className="btn-primary"
            onClick={() => navigate("/checkout")}
          >
            Proceed to Checkout
          </button>

          <button type="button" className="btn-ghost" onClick={clearCart}>
            Clear Cart
          </button>

          <Link to="/" className="btn-ghost">
            Continue Shopping
          </Link>
        </aside>
      </div>
    </div>
  );
}