import React, { useState } from "react";
import StarRating from "./StarRating";
import "./ReviewForm.css";

export default function ReviewForm({ onSubmit, busy }) {
  const [name, setName] = useState("");
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!name.trim()) {
      setError("Please enter your name.");
      return;
    }
    if (!comment.trim()) {
      setError("Please write a comment.");
      return;
    }

    setError("");
    onSubmit({ name: name.trim(), rating, comment: comment.trim() });
    setName("");
    setComment("");
    setRating(5);
  };

  return (
    <form className="review-form" onSubmit={handleSubmit}>
      <h4>Leave a Review</h4>

      {error && <p className="error">{error}</p>}

      <label className="review-form-field">
        Your Name
        <input
          type="text"
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="e.g. Jane Doe"
        />
      </label>

      <div className="review-form-field">
        <span>Your Rating</span>
        <StarRating value={rating} onChange={setRating} readOnly={false} />
      </div>

      <label className="review-form-field">
        Your Comment
        <textarea
          rows="4"
          value={comment}
          onChange={(event) => setComment(event.target.value)}
          placeholder="Tell others what you think about this item..."
        />
      </label>

      <button type="submit" className="btn-primary" disabled={busy}>
        {busy ? "Posting..." : "Post Review"}
      </button>
    </form>
  );
}