import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../api/axios";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { money } from "../utils/format";
import "./Checkout.css";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function Checkout() {
  const { items, total, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [contact, setContact] = useState({
    email: user?.email || "",
    phone: user?.mobilePhone || "",
  });

  const [shipping, setShipping] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    street: "",
    apt: "",
    city: "",
    state: "",
    zip: "",
  });

  const [payment, setPayment] = useState({
    cardNumber: "",
    expiration: "",
    cvc: "",
    pin: "",
  });

  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const updateContact = (key, value) =>
    setContact((prev) => ({ ...prev, [key]: value }));
  const updateShipping = (key, value) =>
    setShipping((prev) => ({ ...prev, [key]: value }));
  const updatePayment = (key, value) =>
    setPayment((prev) => ({ ...prev, [key]: value }));

  if (!items.length) {
    return (
      <div className="checkout-page">
        <h1>Checkout</h1>
        <p className="empty-state">
          Your cart is empty, so there is nothing to check out.
        </p>
        <Link to="/" className="btn-primary">
          Back to Marketplace
        </Link>
      </div>
    );
  }

  const validate = () => {
    if (!EMAIL_REGEX.test(contact.email.trim())) {
      return "Please enter a valid email address.";
    }
    if (!/^\+?[\d\s()-]{7,20}$/.test(contact.phone.trim())) {
      return "Please enter a valid phone number for delivery updates.";
    }
    if (
      !shipping.firstName.trim() ||
      !shipping.lastName.trim() ||
      !shipping.street.trim() ||
      !shipping.city.trim() ||
      !shipping.state.trim() ||
      !shipping.zip.trim()
    ) {
      return "Please complete all required shipping address fields.";
    }
    if (!/^\d{13,19}$/.test(payment.cardNumber.replace(/\s/g, ""))) {
      return "Please enter a valid card number (13-19 digits).";
    }
    if (!/^\d{2}\s*\/\s*\d{2,4}$/.test(payment.expiration.trim())) {
      return "Please enter the expiration date as MM/YY.";
    }
    if (!/^\d{3,4}$/.test(payment.cvc.trim())) {
      return "Please enter a valid security CVC.";
    }
    if (!/^\d{4}$/.test(payment.pin.trim())) {
      return "Please enter your 4-digit card PIN.";
    }
    return "";
  };

  const handlePlaceOrder = async (event) => {
    event.preventDefault();
    setError("");

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setBusy(true);

    const payload = {
      items: items.map((item) => ({
        productId: item.productId,
        title: item.title,
        image: item.image,
        size: item.size,
        qty: item.qty,
        price: item.price,
      })),
      subtotal: total,
      shippingCost: 0,
      total,
      contact: {
        email: contact.email.trim().toLowerCase(),
        phone: contact.phone.trim(),
      },
      shippingAddress: { ...shipping },
      payment: {
        cardNumber: payment.cardNumber.replace(/\s/g, ""),
        expiration: payment.expiration.trim(),
        cvc: payment.cvc.trim(),
        pin: payment.pin.trim(),
      },
      userId: user?._id || null,
      customerName: user
        ? `${user.firstName} ${user.lastName}`
        : `${shipping.firstName} ${shipping.lastName}`,
    };

    try {
      await API.post("/orders", payload);
      clearCart();
      navigate("/processing", { replace: true });
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "We could not place your order. Please try again."
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="checkout-page">
      <h1>Checkout</h1>

      <div className="checkout-layout">
        <form className="checkout-form" onSubmit={handlePlaceOrder}>
          {error && <p className="error">{error}</p>}

          <section className="checkout-section">
            <h2>Contact Information</h2>
            <label className="auth-field">
              Email Address
              <input
                type="email"
                value={contact.email}
                onChange={(event) => updateContact("email", event.target.value)}
                placeholder="you@example.com"
              />
            </label>
            <label className="auth-field">
              Phone Number (delivery updates)
              <input
                type="tel"
                value={contact.phone}
                onChange={(event) => updateContact("phone", event.target.value)}
                placeholder="+1 555 000 0000"
              />
            </label>
          </section>

          <section className="checkout-section">
            <h2>Shipping Address</h2>

            <div className="auth-row">
              <label className="auth-field">
                First Name
                <input
                  type="text"
                  value={shipping.firstName}
                  onChange={(event) =>
                    updateShipping("firstName", event.target.value)
                  }
                />
              </label>
              <label className="auth-field">
                Last Name
                <input
                  type="text"
                  value={shipping.lastName}
                  onChange={(event) =>
                    updateShipping("lastName", event.target.value)
                  }
                />
              </label>
            </div>

            <label className="auth-field">
              Street Address
              <input
                type="text"
                value={shipping.street}
                onChange={(event) =>
                  updateShipping("street", event.target.value)
                }
                placeholder="123 Dogwood Lane"
              />
            </label>

            <label className="auth-field">
              Apt / Suite (optional)
              <input
                type="text"
                value={shipping.apt}
                onChange={(event) => updateShipping("apt", event.target.value)}
              />
            </label>

            <div className="auth-row">
              <label className="auth-field">
                City
                <input
                  type="text"
                  value={shipping.city}
                  onChange={(event) => updateShipping("city", event.target.value)}
                />
              </label>
              <label className="auth-field">
                State
                <input
                  type="text"
                  value={shipping.state}
                  onChange={(event) =>
                    updateShipping("state", event.target.value)
                  }
                />
              </label>
              <label className="auth-field">
                Zip Code
                <input
                  type="text"
                  value={shipping.zip}
                  onChange={(event) => updateShipping("zip", event.target.value)}
                />
              </label>
            </div>
          </section>

          <section className="checkout-section">
            <h2>Payment Information</h2>
            <p className="payment-note">Credit / Debit Card only.</p>

            <label className="auth-field">
              Card Number
              <input
                type="text"
                inputMode="numeric"
                value={payment.cardNumber}
                onChange={(event) =>
                  updatePayment("cardNumber", event.target.value)
                }
                placeholder="4242 4242 4242 4242"
                maxLength={23}
              />
            </label>

            <div className="auth-row">
              <label className="auth-field">
                Expiration (MM/YY)
                <input
                  type="text"
                  value={payment.expiration}
                  onChange={(event) =>
                    updatePayment("expiration", event.target.value)
                  }
                  placeholder="12/28"
                  maxLength={7}
                />
              </label>

              <label className="auth-field">
                Security CVC
                <input
                  type="text"
                  inputMode="numeric"
                  value={payment.cvc}
                  onChange={(event) => updatePayment("cvc", event.target.value)}
                  placeholder="123"
                  maxLength={4}
                />
              </label>

              <label className="auth-field">
                Card PIN
                <input
                  type="password"
                  inputMode="numeric"
                  value={payment.pin}
                  onChange={(event) => updatePayment("pin", event.target.value)}
                  placeholder="••••"
                  maxLength={4}
                />
              </label>
            </div>
          </section>

          <button
            type="submit"
            className="btn-primary place-order-btn"
            disabled={busy}
          >
            {busy ? "Placing Order..." : `Place Order · ${money(total)}`}
          </button>
        </form>

        <aside className="checkout-summary">
          <h2>Order Summary</h2>

          <ul className="checkout-summary-list">
            {items.map((item) => (
              <li key={item.key}>
                <img src={item.image} alt={item.title} />
                <div>
                  <span className="checkout-summary-title">{item.title}</span>
                  <span className="checkout-summary-meta">
                    {item.size} × {item.qty}
                  </span>
                </div>
                <span className="checkout-summary-price">
                  {money(item.price * item.qty)}
                </span>
              </li>
            ))}
          </ul>

          <div className="summary-line">
            <span>Subtotal</span>
            <span>{money(total)}</span>
          </div>

          <div className="summary-line">
            <span>Shipping</span>
            <span>Free</span>
          </div>

          <div className="summary-line total">
            <span>Total</span>
            <strong>{money(total)}</strong>
          </div>
        </aside>
      </div>
    </div>
  );
}