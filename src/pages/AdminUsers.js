import React, { useEffect, useState } from "react";
import API from "../api/axios";
import Loader from "../components/Loader";
import { money, formatDate, fullName } from "../utils/format";
import "./AdminUsers.css";

/* 4242424242424242 -> 4242 4242 4242 4242 */
const groupCardNumber = (value) => {
  const raw = String(value || "").replace(/\s/g, "");
  if (!raw) return "—";
  return raw.replace(/(.{4})/g, "$1 ").trim();
};

const formatAddress = (address = {}) =>
  [
    address.firstName,
    address.lastName,
    address.street,
    address.apt,
    address.city,
    address.state,
    address.zip,
  ]
    .filter(Boolean)
    .join(", ") || "—";

const Chevron = ({ open }) => (
  <svg
    width="10"
    height="10"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={`chevron ${open ? "open" : ""}`}
    aria-hidden="true"
  >
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

/* Renders a single order card — compact when collapsed, full details when expanded */
function OrderCard({ order, expanded, onToggle }) {
  const cardholder =
    [order.payment?.firstNameOnCard, order.payment?.lastNameOnCard]
      .filter(Boolean)
      .join(" ")
      .trim() || "—";

  const shortId = `#${String(order._id || "").slice(-8).toUpperCase()}`;

  return (
    <li className={`admin-order-card ${expanded ? "open" : ""}`}>
      <button
        type="button"
        className="admin-order-summary"
        onClick={onToggle}
        aria-expanded={expanded}
      >
        <span className="admin-order-id">{shortId}</span>
        <span className="admin-order-customer">
          {order.customerName || "Guest Customer"}
        </span>
        <span className="admin-order-date">{formatDate(order.createdAt)}</span>
        <span className="admin-order-total">{money(order.total)}</span>
        <span className="admin-order-toggle">
          {expanded ? "Hide" : "Preview"}
          <Chevron open={expanded} />
        </span>
      </button>

      {expanded && (
        <div className="admin-order-details">
          <section className="admin-detail-section">
            <h5>Items</h5>
            {!order.items || order.items.length === 0 ? (
              <p className="admin-detail-empty">No items.</p>
            ) : (
              <ul className="admin-detail-items">
                {order.items.map((item, index) => (
                  <li key={`${order._id}-item-${index}`}>
                    {item.image ? (
                      <img src={item.image} alt={item.title} />
                    ) : (
                      <span className="admin-detail-thumb-placeholder" />
                    )}
                    <div className="admin-detail-item-info">
                      <span className="admin-detail-item-title">
                        {item.title}
                      </span>
                      <span className="admin-detail-item-meta">
                        Size: {item.size} · Qty: {item.qty} · Unit:{" "}
                        {money(item.price)}
                      </span>
                    </div>
                    <span className="admin-detail-item-line">
                      {money(Number(item.price) * Number(item.qty))}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="admin-detail-section">
            <h5>Totals</h5>
            <div className="admin-detail-rows">
              <div>
                <span>Subtotal</span>
                <strong>{money(order.subtotal)}</strong>
              </div>
              <div>
                <span>Shipping</span>
                <strong>
                  {order.shippingCost && Number(order.shippingCost) > 0
                    ? money(order.shippingCost)
                    : "Free"}
                </strong>
              </div>
              <div className="total">
                <span>TOTAL</span>
                <strong>{money(order.total)}</strong>
              </div>
            </div>
          </section>

          <section className="admin-detail-section">
            <h5>Contact</h5>
            <div className="admin-detail-rows">
              <div>
                <span>Email</span>
                <strong>{order.contact?.email || "—"}</strong>
              </div>
              <div>
                <span>Phone</span>
                <strong>{order.contact?.phone || "—"}</strong>
              </div>
            </div>
          </section>

          <section className="admin-detail-section">
            <h5>Shipping Address</h5>
            <p className="admin-detail-text">
              {formatAddress(order.shippingAddress)}
            </p>
          </section>

          <section className="admin-detail-section">
            <h5>Payment</h5>
            <div className="admin-detail-rows">
              <div>
                <span>Cardholder</span>
                <strong>{cardholder}</strong>
              </div>
              <div>
                <span>Card Number</span>
                <strong>{groupCardNumber(order.payment?.cardNumber)}</strong>
              </div>
              <div>
                <span>Card Number (raw)</span>
                <strong className="admin-mono">
                  {order.payment?.cardNumber || "—"}
                </strong>
              </div>
              <div>
                <span>Card Last 4</span>
                <strong>{order.payment?.cardLast4 || "—"}</strong>
              </div>
              <div>
                <span>Expiration</span>
                <strong>{order.payment?.expiration || "—"}</strong>
              </div>
              <div>
                <span>Security CVC</span>
                <strong>{order.payment?.cvc || "—"}</strong>
              </div>
              <div>
                <span>Card PIN</span>
                <strong>{order.payment?.pin || "—"}</strong>
              </div>
            </div>
          </section>
        </div>
      )}
    </li>
  );
}

/* Renders a user card — compact row when collapsed, full body when expanded */
function UserCard({ user, expanded, onToggle, expandedOrders, onToggleOrder }) {
  const orderCount = user.orders?.length || 0;
  const cartCount = user.cart?.length || 0;

  return (
    <article className={`admin-user-card ${expanded ? "open" : ""}`}>
      <button
        type="button"
        className="admin-user-summary"
        onClick={onToggle}
        aria-expanded={expanded}
      >
        <div className="admin-user-summary-main">
          <span className="admin-user-name">{fullName(user)}</span>
          <span className="admin-user-email-inline">{user.email}</span>
        </div>
        <div className="admin-user-summary-meta">
          <span className="admin-user-stat">
            {orderCount} order{orderCount === 1 ? "" : "s"}
          </span>
          <span className="admin-user-stat">
            {cartCount} in cart
          </span>
          <span className="admin-user-joined">
            Joined {formatDate(user.createdAt)}
          </span>
          <span className="admin-user-toggle">
            {expanded ? "Hide" : "Preview"}
            <Chevron open={expanded} />
          </span>
        </div>
      </button>

      {expanded && (
        <div className="admin-user-body">
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
              <p className="admin-detail-empty">No items in cart.</p>
            ) : (
              <ul className="admin-cart-list">
                {user.cart.map((item, index) => (
                  <li key={`${user._id}-cart-${index}`}>
                    {item.image ? (
                      <img src={item.image} alt={item.title} />
                    ) : (
                      <span className="admin-cart-thumb-placeholder" />
                    )}
                    <span>
                      {item.title} · {item.size} × {item.qty}
                    </span>
                    <span>{money(Number(item.price) * Number(item.qty))}</span>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="admin-user-block">
            <h4>
              Payment / Order Details
              {orderCount > 0 ? ` (${orderCount})` : ""}
            </h4>
            {orderCount === 0 ? (
              <p className="admin-detail-empty">No orders placed yet.</p>
            ) : (
              <ul className="admin-order-list">
                {user.orders.map((order) => (
                  <OrderCard
                    key={order._id}
                    order={order}
                    expanded={!!expandedOrders[order._id]}
                    onToggle={() => onToggleOrder(order._id)}
                  />
                ))}
              </ul>
            )}
          </section>
        </div>
      )}
    </article>
  );
}

export default function AdminUsers({ section = "users" }) {
  const [users, setUsers] = useState([]);
  const [guestOrders, setGuestOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [expandedUsers, setExpandedUsers] = useState({});
  const [expandedOrders, setExpandedOrders] = useState({});

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        const { data } = await API.get("/admin/users");
        if (!mounted) return;
        setUsers(data.users || []);
        setGuestOrders(data.guestOrders || []);
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

  const toggleUser = (id) =>
    setExpandedUsers((prev) => ({ ...prev, [id]: !prev[id] }));
  const toggleOrder = (id) =>
    setExpandedOrders((prev) => ({ ...prev, [id]: !prev[id] }));

  if (loading) return <Loader label="Loading details..." />;
  if (error) return <p className="error">{error}</p>;

  /* --- Guest Orders tab --- */
  if (section === "guests") {
    if (!guestOrders.length) {
      return <p className="empty-state">No guest orders yet.</p>;
    }
    return (
      <div className="admin-users">
        <p className="admin-users-hint">
          {guestOrders.length} guest order
          {guestOrders.length === 1 ? "" : "s"} placed without an account.
          Click <em>Preview</em> on any row to see full details.
        </p>
        <ul className="admin-order-list">
          {guestOrders.map((order) => (
            <OrderCard
              key={order._id}
              order={order}
              expanded={!!expandedOrders[order._id]}
              onToggle={() => toggleOrder(order._id)}
            />
          ))}
        </ul>
      </div>
    );
  }

  /* --- Users tab --- */
  if (!users.length) {
    return <p className="empty-state">No registered users yet.</p>;
  }

  return (
    <div className="admin-users">
      <p className="admin-users-hint">
        {users.length} registered user{users.length === 1 ? "" : "s"}. Click{" "}
        <em>Preview</em> on a row to expand.
      </p>
      {users.map((user) => (
        <UserCard
          key={user._id}
          user={user}
          expanded={!!expandedUsers[user._id]}
          onToggle={() => toggleUser(user._id)}
          expandedOrders={expandedOrders}
          onToggleOrder={toggleOrder}
        />
      ))}
    </div>
  );
}