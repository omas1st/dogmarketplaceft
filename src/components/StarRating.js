import React, { useState } from "react";
import "./StarRating.css";

export default function StarRating({
  value = 0,
  onChange,
  readOnly = true,
  size = "md",
}) {
  const [hover, setHover] = useState(0);
  const active = hover || value;

  return (
    <div
      className={`star-rating ${size} ${readOnly ? "readonly" : "interactive"}`}
      role={readOnly ? "img" : "radiogroup"}
      aria-label={`Rating: ${value} out of 5`}
    >
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          className={`star ${active >= star ? "filled" : ""}`}
          onClick={() => !readOnly && onChange && onChange(star)}
          onMouseEnter={() => !readOnly && setHover(star)}
          onMouseLeave={() => !readOnly && setHover(0)}
          role={readOnly ? undefined : "radio"}
          aria-checked={readOnly ? undefined : value === star}
        >
          ★
        </span>
      ))}
    </div>
  );
}