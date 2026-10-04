import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { money } from "../utils/format";
import "./ProductCard.css";

const DEFAULT_SIZES = ["One Size"];

const SameDayIcon = () => (
  <svg
    width="12"
    height="12"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M3 7h11v8H3z" />
    <path d="M14 10h4l3 3v2h-7z" />
    <circle cx="7.5" cy="17.5" r="1.6" />
    <circle cx="17.5" cy="17.5" r="1.6" />
  </svg>
);

export default function ProductCard({ product }) {
  const { addToCart } = useCart();

  const sizes =
    Array.isArray(product.sizes) && product.sizes.length
      ? product.sizes
      : DEFAULT_SIZES;

  const [size, setSize] = useState(sizes[0]);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  const inStock = product.stockStatus !== "out_stock";

  const handleAddToCart = () => {
    if (!inStock) return;
    addToCart(product, size, qty);
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1500);
  };

  return (
    <article className="product-card">
      <Link to={`/product/${product._id}`} className="product-card-image-link">
        <img
          src={product.image}
          alt={product.title}
          className="product-card-image"
          loading="lazy"
        />
      </Link>

      <div className="product-card-body">
        <h3 className="product-card-title">
          <Link to={`/product/${product._id}`}>{product.title}</Link>
        </h3>

        <p className="product-card-category">
          {product.categoryLabel || product.category}
        </p>

        <div className="product-card-prices">
          <span className="price-original">{money(product.originalPrice)}</span>
          <span className="price-current">{money(product.sellingPrice)}</span>
          {product.discountPercent > 0 && (
            <span className="price-discount">-{product.discountPercent}%</span>
          )}
        </div>

        <p className={`stock-status ${inStock ? "in" : "out"}`}>
          {inStock ? "In Stock" : "Out of Stock"}
        </p>

        <p className="same-day-badge">
          <SameDayIcon />
          Same-Day Delivery
        </p>

        <div className="product-card-controls">
          <label>
            Size
            <select
              value={size}
              onChange={(event) => setSize(event.target.value)}
              disabled={!inStock}
            >
              {sizes.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>

          <label>
            Qty
            <select
              value={qty}
              onChange={(event) => setQty(Number(event.target.value))}
              disabled={!inStock}
            >
              {Array.from({ length: 10 }, (_, index) => index + 1).map((num) => (
                <option key={num} value={num}>
                  {num}
                </option>
              ))}
            </select>
          </label>
        </div>

        <button
          type="button"
          className="add-to-cart-btn"
          onClick={handleAddToCart}
          disabled={!inStock}
        >
          {!inStock ? "Out of Stock" : added ? "Added ✓" : "Add to Cart"}
        </button>
      </div>
    </article>
  );
}