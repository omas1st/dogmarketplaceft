import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import Home from "./Home";
import Loader from "../components/Loader";
import { money, formatDate, fullName } from "../utils/format";
import "./UserDashboard.css";

export default function UserDashboard() {
  const { user } = useAuth();
  const { items, total, count } = useCart();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        const { data } = await API.get("/orders/mine");
        if (mounted) setOrders(data.orders || data || []);
      } catch (err) {
        if (mounted) {
          setError(
            err.response?.data?.message ||
              "Your transaction history could not be loaded."
          );
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="user-dashboard">
      <section className="dashboard-welcome">
        <h1>Welcome back, {fullName(user)}</h1>
        <p>{user?.email}</p>
      </section>

      <section className="dashboard-cart">
        <div className="dashboard-section-head">
          <h2>My Cart</h2>
          <Link to="/cart" className="btn-ghost">
            Open Full Cart
          </Link>
        </div>

        {items.length === 0 ? (
          <p className="empty-state">Your cart is empty.</p>
        ) : (
          <>
            <ul className="dashboard-cart-list">
              {items.map((item) => (
                <li key={item.key}>
                  <img src={item.image} alt={item.title} />
                  <div>
                    <span className="dashboard-cart-title">{item.title}</span>
                    <span className="dashboard-cart-meta">
                      {item.size} × {item.qty}
                    </span>
                  </div>
                  <span>{money(item.price * item.qty)}</span>
                </li>
              ))}
            </ul>
            <p className="dashboard-cart-total">
              {count} item(s) · Estimated total <strong>{money(total)}</strong>
            </p>
            <Link to="/checkout" className="btn-primary">
              Proceed to Checkout
            </Link>
          </>
        )}
      </section>

      <section className="dashboard-transactions">
        <h2>Transaction History</h2>

        {loading ? (
          <Loader label="Loading your transactions..." />
        ) : error ? (
          <p className="error">{error}</p>
        ) : orders.length === 0 ? (
          <p className="empty-state">You have no transactions yet.</p>
        ) : (
          <ul className="transaction-list">
            {orders.map((order) => (
              <li key={order._id} className="transaction-item">
                <div className="transaction-head">
                  <span className="transaction-id">
                    Order #{order._id.slice(-8).toUpperCase()}
                  </span>
                  <span className="transaction-date">
                    {formatDate(order.createdAt)}
                  </span>
                </div>

                <ul className="transaction-items">
                  {(order.items || []).map((item, index) => (
                    <li key={`${order._id}-${index}`}>
                      <img src={item.image} alt={item.title} />
                      <span>
                        {item.title} · {item.size} × {item.qty}
                      </span>
                      <span>{money(item.price * item.qty)}</span>
                    </li>
                  ))}
                </ul>

                <div className="transaction-foot">
                  <span className={`transaction-status ${order.status || ""}`}>
                    {order.status || "processing"}
                  </span>
                  <strong>{money(order.total)}</strong>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="dashboard-marketplace">
        <Home />
      </section>
    </div>
  );
}