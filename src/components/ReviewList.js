import React from "react";
import StarRating from "./StarRating";
import "./ReviewList.css";

export default function ReviewList({ reviews = [], canDelete, onDelete }) {
  const sorted = [...reviews].sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  );

  if (!sorted.length) {
    return (
      <p className="review-empty">
        No reviews yet. Be the first to review this item.
      </p>
    );
  }

  return (
    <ul className="review-list">
      {sorted.map((review) => (
        <li key={review._id} className="review-item">
          <div className="review-item-head">
            <span className="review-item-name">{review.name}</span>
          </div>

          <StarRating value={review.rating} readOnly size="sm" />

          <p className="review-item-comment">{review.comment}</p>

          {canDelete && (
            <button
              type="button"
              className="review-item-delete"
              onClick={() => onDelete(review._id)}
            >
              Delete
            </button>
          )}
        </li>
      ))}
    </ul>
  );
}