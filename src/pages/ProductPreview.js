import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import API from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import StarRating from "../components/StarRating";
import ReviewList from "../components/ReviewList";
import ReviewForm from "../components/ReviewForm";
import Loader from "../components/Loader";
import { money } from "../utils/format";
import "./ProductPreview.css";

const DEFAULT_SIZES = ["One Size"];

export default function ProductPreview() {
  const { id } = useParams();
  const { isAdmin } = useAuth();
  const { addToCart } = useCart();

  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [posting, setPosting] = useState(false);

  const [size, setSize] = useState(DEFAULT_SIZES[0]);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  const loadProduct = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const { data } = await API.get(`/products/${id}`);
      const loaded = data.product || data;
      setProduct(loaded);

      const loadedReviews = loaded.reviews || data.reviews || [];
      setReviews(loadedReviews);
      setSize(
        Array.isArray(loaded.sizes) && loaded.sizes.length
          ? loaded.sizes[0]
          : "One Size"
      );
    } catch (err) {
      setError(
        err.response?.data?.message || "This item could not be loaded."
      );
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadProduct();
  }, [loadProduct]);

  const sizes =
    product && Array.isArray(product.sizes) && product.sizes.length
      ? product.sizes
      : DEFAULT_SIZES;

  const averageRating = useMemo(() => {
    if (!reviews.length) return 0;
    const sum = reviews.reduce((total, review) => total + review.rating, 0);
    return sum / reviews.length;
  }, [reviews]);

  const inStock = product ? product.stockStatus !== "out_stock" : false;

  const handleAddToCart = () => {
    if (!product || !inStock) return;
    addToCart(product, size, qty);
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1500);
  };

  const handleReviewSubmit = async (payload) => {
    setPosting(true);

    try {
      const { data } = await API.post(`/products/${id}/reviews`, payload);
      const newReview = data.review || data;
      setReviews((prev) => [newReview, ...prev]);
    } catch (err) {
      setError(
        err.response?.data?.message || "Your review could not be posted."
      );
    } finally {
      setPosting(false);
    }
  };

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm("Delete this review permanently?")) return;

    try {
      await API.delete(`/products/${id}/reviews/${reviewId}`);
      setReviews((prev) => prev.filter((review) => review._id !== reviewId));
    } catch (err) {
      setError(err.response?.data?.message || "Review could not be deleted.");
    }
  };

  if (loading) return <Loader label="Loading item..." />;
  if (error && !product) return <p className="error page-error">{error}</p>;
  if (!product) return null;

  return (
    <div className="product-preview">
      <div className="product-preview-top">
        <div className="product-preview-media">
          <img src={product.image} alt={product.title} />
        </div>

        <div className="product-preview-details">
          <h1>{product.title}</h1>

          <p className="product-preview-category">
            {product.categoryLabel || product.category}
          </p>

          <div className="product-preview-rating">
            <StarRating value={Math.round(averageRating)} readOnly />
            <span>
              {averageRating.toFixed(1)} out of 5 · {reviews.length} review(s)
            </span>
          </div>

          <div className="product-preview-prices">
            <span className="price-original">{money(product.originalPrice)}</span>
            <span className="price-current">{money(product.sellingPrice)}</span>
            {product.discountPercent > 0 && (
              <span className="price-discount">
                {product.discountPercent}% OFF
              </span>
            )}
          </div>

          <p className={`stock-status ${inStock ? "in" : "out"}`}>
            {inStock ? "In Stock" : "Out of Stock"}
          </p>

          <div className="product-preview-description">
            <h3>Description</h3>
            <p>{product.description}</p>
          </div>

          <div className="product-preview-controls">
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
              Quantity
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
            {!inStock ? "Out of Stock" : added ? "Added to Cart ✓" : "Add to Cart"}
          </button>
        </div>
      </div>

      <section className="product-reviews">
        <h2>Customer Reviews</h2>

        {error && <p className="error">{error}</p>}

        <ReviewForm onSubmit={handleReviewSubmit} busy={posting} />

        <ReviewList
          reviews={reviews}
          canDelete={isAdmin}
          onDelete={handleDeleteReview}
        />
      </section>
    </div>
  );
}