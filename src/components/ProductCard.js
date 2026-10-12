import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { money } from "../utils/format";
import "./ProductCard.css";

const DEFAULT_SIZES = ["One Size"];
const FOOD_CATEGORIES = ["food", "food_chews_feeding"];

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

/* Apply the discount % to a food size price (original → selling) */
const applyDiscount = (price, discountPercent) => {
  const p = Number(price) || 0;
  const d = Number(discountPercent) || 0;
  return p * (1 - d / 100);
};

export default function ProductCard({ product }) {
  const { addToCart } = useCart();

  const isFood = FOOD_CATEGORIES.includes(product.category);
  const discountPercent = Number(product.discountPercent) || 0;

  const sizes = useMemo(() => {
    if (isFood) {
      if (Array.isArray(product.foodSizes) && product.foodSizes.length) {
        return product.foodSizes.map((fs) => fs.size);
      }
      if (Array.isArray(product.sizes) && product.sizes.length) {
        return product.sizes;
      }
      return ["15-lb bag"];
    }
    return Array.isArray(product.sizes) && product.sizes.length
      ? product.sizes
      : DEFAULT_SIZES;
  }, [product.sizes, product.foodSizes, isFood]);

  const colors = useMemo(() => {
    if (isFood) return [];
    return Array.isArray(product.colors) && product.colors.length
      ? product.colors
      : [];
  }, [product.colors, isFood]);

  const [size, setSize] = useState(sizes[0]);
  const [color, setColor] = useState(colors[0] || "");
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    setSize(sizes[0]);
  }, [sizes]);

  useEffect(() => {
    setColor(colors[0] || "");
  }, [colors]);

  /* Food: look up the foodSize for the selected size. The stored price is
     the ORIGINAL. Apply the product-level discount to get the selling
     price. Non-food: use the product's pre-computed sellingPrice. */
  const foodSizeEntry = useMemo(() => {
    if (!isFood || !Array.isArray(product.foodSizes)) return null;
    return product.foodSizes.find((fs) => fs.size === size) || null;
  }, [isFood, product.foodSizes, size]);

  const activeOriginal = isFood
    ? Number(foodSizeEntry?.price) || 0
    : Number(product.originalPrice) || 0;

  const activePrice = isFood
    ? applyDiscount(foodSizeEntry?.price || 0, discountPercent)
    : Number(product.sellingPrice) || 0;

  const inStock = product.stockStatus !== "out_stock";

  const handleAddToCart = () => {
    if (!inStock) return;
    addToCart(product, size, qty, color, isFood ? activePrice : null);
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
          {activeOriginal > 0 && (
            <span className="price-original">{money(activeOriginal)}</span>
          )}
          <span className="price-current">{money(activePrice)}</span>
          {discountPercent > 0 && (
            <span className="price-discount">-{discountPercent}%</span>
          )}
        </div>

        <p className={`stock-status ${inStock ? "in" : "out"}`}>
          {inStock ? "In Stock" : "Out of Stock"}
        </p>

        <p className="same-day-badge">
          <SameDayIcon />
          Same-Day Delivery
        </p>

        <div
          className={`product-card-controls ${
            colors.length ? "with-color" : ""
          }`}
        >
          {colors.length > 0 && (
            <label>
              Colour
              <select
                value={color}
                onChange={(event) => setColor(event.target.value)}
                disabled={!inStock}
              >
                {colors.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>
          )}

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