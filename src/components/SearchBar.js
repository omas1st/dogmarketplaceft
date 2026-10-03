import React from "react";
import "./SearchBar.css";

export default function SearchBar({ value, onChange, onSubmit }) {
  return (
    <form className="search-bar" onSubmit={onSubmit}>
      <input
        type="text"
        className="search-input"
        placeholder="Search dog supplies, breeds, toys, beds..."
        value={value}
        onChange={(event) => onChange(event.target.value)}
        aria-label="Search the marketplace"
      />
      <button type="submit" className="search-btn">
        Search
      </button>
    </form>
  );
}