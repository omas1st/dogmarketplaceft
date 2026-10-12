import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import API from "../api/axios";
import Loader from "../components/Loader";
import { money } from "../utils/format";
import "./AdminMarketplace.css";

/* Category filter options — labels match the product form */
const CATEGORY_FILTER_OPTIONS = [
  { value: "all", label: "All Categories" },
  { value: "dog_clothing_accessories", label: "Dog; Clothing and Accessories" },
  { value: "food", label: "Food" },
  { value: "chews", label: "Chews" },
  { value: "feeding", label: "Feeding" },
  { value: "bed", label: "Bed" },
  { value: "collar_leashes_harnesses", label: "Collar, Leashes and Harnesses" },
  { value: "toy", label: "Toy" },
  { value: "crates_gates_pens", label: "Crates, Gates and Pens" },
  { value: "food_chews_feeding", label: "Food, Chews and Feeding (legacy)" },
];

/* Price filter options — applied to the product's selling price */
const PRICE_FILTER_OPTIONS = [
  { value: "all", label: "All Prices", min: null, max: null },
  { value: "under-25", label: "Under $25", min: 0, max: 25 },
  { value: "25-50", label: "$25 – $50", min: 25, max: 50 },
  { value: "50-100", label: "$50 – $100", min: 50, max: 100 },
  { value: "100-250", label: "$100 – $250", min: 100, max: 250 },
  { value: "250-plus", label: "$250+", min: 250, max: null },
];

export default function AdminMarketplace() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /* Filter state */
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [priceRange, setPriceRange] = useState("all");

  const loadItems = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const { data } = await API.get("/products", { params: { all: true } });
      setItems(data.products || data || []);
    } catch (err) {
      setError(
        err.response?.data?.message || "Items could not be loaded."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadItems();
  }, [loadItems]);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this item permanently?")) return;

    try {
      await API.delete(`/products/${id}`);
      setItems((prev) => prev.filter((item) => item._id !== id));
    } catch (err) {
      setError(err.response?.data?.message || "Item could not be deleted.");
    }
  };

  const handleResetFilters = () => {
    setSearch("");
    setCategory("all");
    setPriceRange("all");
  };

  /* Apply search + category + price filters */
  const filteredItems = useMemo(() => {
    const query = search.trim().toLowerCase();
    const price = PRICE_FILTER_OPTIONS.find((p) => p.value === priceRange);

    return items.filter((item) => {
      /* Search — matches title, description, category label, or category */
      if (query) {
        const haystack = [
          item.title,
          item.description,
          item.categoryLabel,
          item.category,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        if (!haystack.includes(query)) return false;
      }

      /* Category */
      if (category !== "all" && item.category !== category) {
        return false;
      }

      /* Price — uses the product's selling price */
      if (price && price.min !== null) {
        const value = Number(item.sellingPrice) || 0;
        if (value < price.min) return false;
        if (price.max !== null && value >= price.max) return false;
      }

      return true;
    });
  }, [items, search, category, priceRange]);

  const hasActiveFilters =
    search.trim() !== "" || category !== "all" || priceRange !== "all";

  return (
    <div className="admin-marketplace">
      <div className="admin-marketplace-head">
        <h2>
          All Items ({filteredItems.length}
          {hasActiveFilters ? ` of ${items.length}` : ""})
        </h2>
        <Link to="/admin/items/new" className="btn-primary">
          + Add Item
        </Link>
      </div>

      {error && <p className="error">{error}</p>}

      {/* ---------- Filter bar ---------- */}
      {!loading && items.length > 0 && (
        <div className="admin-marketplace-filters">
          <div className="admin-filter-item admin-filter-search">
            <span className="admin-filter-label">Search</span>
            <input
              type="text"
              placeholder="Search by title or description…"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              aria-label="Search items"
            />
          </div>

          <div className="admin-filter-item">
            <span className="admin-filter-label">Category</span>
            <select
              value={category}
              onChange={(event) => setCategory(event.target.value)}
              aria-label="Filter by category"
            >
              {CATEGORY_FILTER_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="admin-filter-item">
            <span className="admin-filter-label">Price</span>
            <select
              value={priceRange}
              onChange={(event) => setPriceRange(event.target.value)}
              aria-label="Filter by price"
            >
              {PRICE_FILTER_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {hasActiveFilters && (
            <button
              type="button"
              className="admin-filter-reset"
              onClick={handleResetFilters}
            >
              Clear
            </button>
          )}
        </div>
      )}

      {loading ? (
        <Loader label="Loading items..." />
      ) : items.length === 0 ? (
        <p className="empty-state">No items yet. Add your first item.</p>
      ) : filteredItems.length === 0 ? (
        <p className="empty-state">
          No items match your filters.{" "}
          <button
            type="button"
            className="admin-empty-reset"
            onClick={handleResetFilters}
          >
            Clear filters
          </button>
        </p>
      ) : (
        <div className="admin-items-table-wrap">
          <table className="admin-items-table">
            <thead>
              <tr>
                <th>Image</th>
                <th>Title</th>
                <th>Type</th>
                <th>Category</th>
                <th>Original</th>
                <th>Discount</th>
                <th>Selling</th>
                <th>Stock</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.map((item) => (
                <tr key={item._id}>
                  <td>
                    <img
                      src={item.image}
                      alt={item.title}
                      className="admin-thumb"
                    />
                  </td>
                  <td>{item.title}</td>
                  <td>
                    {item.itemType === "dog_adoption"
                      ? "Dog for Adoption"
                      : "Dog Supply"}
                  </td>
                  <td>{item.categoryLabel || item.category}</td>
                  <td>{money(item.originalPrice)}</td>
                  <td>{item.discountPercent}%</td>
                  <td>{money(item.sellingPrice)}</td>
                  <td>
                    <span
                      className={`stock-status ${
                        item.stockStatus === "out_stock" ? "out" : "in"
                      }`}
                    >
                      {item.stockStatus === "out_stock"
                        ? "Out of Stock"
                        : "In Stock"}
                    </span>
                  </td>
                  <td className="admin-item-actions">
                    <Link
                      to={`/admin/items/${item._id}/edit`}
                      className="btn-ghost"
                    >
                      Edit
                    </Link>
                    <button
                      type="button"
                      className="btn-danger"
                      onClick={() => handleDelete(item._id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}