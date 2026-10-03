import React, { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../api/axios";
import Loader from "../components/Loader";
import { money } from "../utils/format";
import "./AdminMarketplace.css";

export default function AdminMarketplace() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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

  return (
    <div className="admin-marketplace">
      <div className="admin-marketplace-head">
        <h2>All Items ({items.length})</h2>
        <Link to="/admin/items/new" className="btn-primary">
          + Add Item
        </Link>
      </div>

      {error && <p className="error">{error}</p>}

      {loading ? (
        <Loader label="Loading items..." />
      ) : items.length === 0 ? (
        <p className="empty-state">No items yet. Add your first item.</p>
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
              {items.map((item) => (
                <tr key={item._id}>
                  <td>
                    <img src={item.image} alt={item.title} className="admin-thumb" />
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
                    <Link to={`/admin/items/${item._id}/edit`} className="btn-ghost">
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