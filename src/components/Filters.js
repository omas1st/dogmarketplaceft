import React from "react";
import "./Filters.css";

export const TYPE_OPTIONS = [
  { value: "all", label: "All Types" },
  { value: "toy", label: "Toy" },
  { value: "bed", label: "Bed" },
  { value: "collar", label: "Collar" },
  { value: "leash", label: "Leash" },
  { value: "harness", label: "Harness" },
  { value: "crate", label: "Crate" },
  { value: "clothing", label: "Clothing" },
  { value: "food", label: "Food" },
  { value: "chew", label: "Chew" },
  { value: "bowl", label: "Bowl" },
  { value: "grooming", label: "Grooming" },
  { value: "adoption", label: "Adoption" },
];

export const PRICE_OPTIONS = [
  { value: "all", label: "All Prices", min: "", max: "" },
  { value: "under-25", label: "Under $25", min: "", max: "25" },
  { value: "25-50", label: "$25 – $50", min: "25", max: "50" },
  { value: "50-100", label: "$50 – $100", min: "50", max: "100" },
  { value: "100-plus", label: "$100+", min: "100", max: "" },
];

export const SORT_OPTIONS = [
  { value: "random", label: "Random / Shuffled" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "newest", label: "Newest" },
];

const IconType = () => (
  <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 6h18M3 12h18M3 18h12" />
  </svg>
);

const IconPrice = () => (
  <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.59 13.41 13.42 20.6a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82Z" />
    <circle cx="7" cy="7" r="1.5" />
  </svg>
);

const IconSort = () => (
  <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M7 3v18M3 7l4-4 4 4M17 21V3M13 17l4 4 4-4" />
  </svg>
);

const findPrice = (value) =>
  PRICE_OPTIONS.find((option) => option.value === value) || PRICE_OPTIONS[0];

export default function Filters({
  filters,
  onChange,
  onReset,
  sort,
  onSortChange,
}) {
  const update = (key, value) => onChange({ ...filters, [key]: value });

  const priceValue =
    filters.minPrice === "" && filters.maxPrice === ""
      ? "all"
      : filters.minPrice === "" && filters.maxPrice === "25"
      ? "under-25"
      : filters.minPrice === "25" && filters.maxPrice === "50"
      ? "25-50"
      : filters.minPrice === "50" && filters.maxPrice === "100"
      ? "50-100"
      : filters.minPrice === "100" && filters.maxPrice === ""
      ? "100-plus"
      : "all";

  const handlePriceChange = (value) => {
    const option = findPrice(value);
    onChange({ ...filters, minPrice: option.min, maxPrice: option.max });
  };

  return (
    <section className="filters">
      <div className="filter-grid">
        <div className="filter-item">
          <span className="filter-label">
            <IconType />
            Type
          </span>
          <select
            value={filters.type}
            onChange={(event) => update("type", event.target.value)}
            aria-label="Filter by type"
          >
            {TYPE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-item">
          <span className="filter-label">
            <IconPrice />
            Price
          </span>
          <select
            value={priceValue}
            onChange={(event) => handlePriceChange(event.target.value)}
            aria-label="Filter by price"
          >
            {PRICE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {onSortChange && (
          <div className="filter-item">
            <span className="filter-label">
              <IconSort />
              Sort
            </span>
            <select
              value={sort}
              onChange={(event) => onSortChange(event.target.value)}
              aria-label="Sort products"
            >
              {SORT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      <button type="button" className="filter-reset" onClick={onReset}>
        Clear
      </button>
    </section>
  );
}