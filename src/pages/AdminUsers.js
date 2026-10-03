import React, { useEffect, useState } from "react";
import API from "../api/axios";
import Loader from "../components/Loader";
import { money, formatDate, fullName } from "../utils/format";
import "./AdminUsers.css";

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        const { data } = await API.get("/admin/users");
        if (mounted) setUsers(data.users || data || []);
      } catch (err) {
        if (mounted) {
          setError(
            err.response?.data?.message || "User details could not be loaded."
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

  if (loading) return <Loader label="Loading users..." />;
  if (error) return <p className="error">{error}</p>;
  if (!users.length) return <p className="empty-state">No registered users yet.</p>;

  return (
    <div className="admin-users">
      {users.map((user) => (
        <article key={user._id} className="admin-user-card">
          <header className="admin-user-head">
            <div>
              <h3>{fullName(user)}</h3>
              <p className="admin-user-email">{user.email}</p>
            </div>
            <span className="admin-user-joined">
              Joined {formatDate(user.createdAt)}
            </span>
          </header>

          <div className="admin-user-grid">
            <p>
              <strong>Phone:</strong> {user.mobilePhone || "—"}
            </p>
            <p>
              <strong>Role:</strong> {user.role || "user"}
            </p>
          </div>

          <section className="admin-user-block">
            <h4>Cart Items</h4>
            {!user.cart || user.cart.length === 0 ? (
              <p className="empty-state">No items in cart.</p>
            ) : (
              <ul className="admin-cart-list">
                {user.cart.map((item, index) => (
                  <li key={`${user._id}-cart-${index}`}>
                    <img src={item.image} alt={item.title} />
                    <span>
                      {item.title} · {item.size} × {item.qty}
                    </span>
                    <span>{money(item.price * item.qty)}</span>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="admin-user-block">
            <h4>Payment / Order Details</h4>
            {!user.orders || user.orders.length === 0 ? (
              <p className="empty-state">No orders placed yet.</p>
            ) : (
              <ul className="admin-order-list">
                {user.orders.map((order) => (
                  <li key={order._id}>
                    <div className="admin-order-head">
                      <span>#{order._id.slice(-8).toUpperCase()}</span>
                      <span>{formatDate(order.createdAt)}</span>
                    </div>

                    <p>
                      <strong>Total:</strong> {money(order.total)} ·{" "}
                      <strong>Shipping:</strong> Free
                    </p>

                    <p>
                      <strong>Card ending:</strong>{" "}
                      {order.payment?.cardLast4 || "—"} ·{" "}
                      <strong>Exp:</strong> {order.payment?.expiration || "—"}
                    </p>

                    <p>
                      <strong>Contact:</strong> {order.contact?.email || "—"} ·{" "}
                      {order.contact?.phone || "—"}
                    </p>

                    <p>
                      <strong>Ship to:</strong>{" "}
                      {[
                        order.shippingAddress?.firstName,
                        order.shippingAddress?.lastName,
                        order.shippingAddress?.street,
                        order.shippingAddress?.apt,
                        order.shippingAddress?.city,
                        order.shippingAddress?.state,
                        order.shippingAddress?.zip,
                      ]
                        .filter(Boolean)
                        .join(", ")}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </article>
      ))}
    </div>
  );
}