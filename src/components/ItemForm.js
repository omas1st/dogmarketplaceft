import React, { useEffect, useMemo, useRef, useState } from "react";
import API from "../api/axios";
import { money } from "../utils/format";
import "./ItemForm.css";

export const CATEGORY_OPTIONS = [
  { value: "dog_clothing_accessories", label: "Dog; Clothing and Accessories" },
  { value: "food_chews_feeding", label: "Food, Chews and Feeding" },
  { value: "bed", label: "Bed" },
  { value: "collar_leashes_harnesses", label: "Collar, Leashes and Harnesses" },
  { value: "toy", label: "Toy" },
  { value: "crates_gates_pens", label: "Crates, Gates and Pens" },
];

/* Default size set used when creating a new item.
   Admins can freely edit or clear this field. */
export const DEFAULT_SIZES = "XS, S, M, L, XL, XXL";

const EMPTY_FORM = {
  itemType: "dog_supply",
  title: "",
  description: "",
  originalPrice: "",
  discountPercent: 20,
  category: "dog_clothing_accessories",
  stockStatus: "in_stock",
  image: "",
  sizes: DEFAULT_SIZES,
};

export default function ItemForm({
  initialValues,
  onSubmit,
  submitLabel = "Save & Publish Item",
  busy,
}) {
  const [form, setForm] = useState({ ...EMPTY_FORM, ...(initialValues || {}) });
  const [imageMode, setImageMode] = useState("url");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const fileRef = useRef(null);

  useEffect(() => {
    if (initialValues) {
      // For editing an existing item: keep whatever sizes it already has,
      // even if it's an empty string, so the admin doesn't accidentally
      // re-populate sizes when they didn't intend to.
      setForm({ ...EMPTY_FORM, ...initialValues });
    }
  }, [initialValues]);

  const update = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const sellingPrice = useMemo(() => {
    const original = parseFloat(form.originalPrice);
    if (Number.isNaN(original)) return "";

    const discount = parseFloat(form.discountPercent);
    const safeDiscount = Number.isNaN(discount) ? 0 : discount;
    const selling = original - (original * safeDiscount) / 100;

    return selling.toFixed(2);
  }, [form.originalPrice, form.discountPercent]);

  const handleFileUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("image", file);

      const { data } = await API.post("/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      update("image", data.url || data.secure_url);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Image upload failed. Please try the image URL option instead."
      );
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    setError("");

    if (!form.title.trim()) {
      setError("Please enter the item name/title.");
      return;
    }
    if (!form.description.trim()) {
      setError("Please enter the product description.");
      return;
    }
    if (Number.isNaN(parseFloat(form.originalPrice))) {
      setError("Please enter a valid original price.");
      return;
    }
    if (!form.image.trim()) {
      setError("Please provide a product image (URL or file upload).");
      return;
    }

    onSubmit({
      itemType: form.itemType,
      title: form.title.trim(),
      description: form.description.trim(),
      originalPrice: Number(form.originalPrice),
      discountPercent: Number(form.discountPercent) || 0,
      sellingPrice: Number(sellingPrice),
      category: form.category,
      stockStatus: form.stockStatus,
      image: form.image.trim(),
      sizes: form.sizes
        ? form.sizes
            .split(",")
            .map((size) => size.trim())
            .filter(Boolean)
        : [],
    });
  };

  return (
    <form className="item-form" onSubmit={handleSubmit}>
      {error && <p className="error">{error}</p>}

      <label className="auth-field">
        Item Type
        <select
          value={form.itemType}
          onChange={(event) => update("itemType", event.target.value)}
        >
          <option value="dog_supply">Dog Supply</option>
          <option value="dog_adoption">Dog for Adoption</option>
        </select>
      </label>

      <label className="auth-field">
        Item Name / Title
        <input
          type="text"
          value={form.title}
          onChange={(event) => update("title", event.target.value)}
          placeholder="e.g. Chew-Proof Bone Toy"
        />
      </label>

      <label className="auth-field">
        Product Description
        <textarea
          rows="5"
          value={form.description}
          onChange={(event) => update("description", event.target.value)}
          placeholder="Describe the item, materials, sizing and care..."
        />
      </label>

      <div className="auth-row">
        <label className="auth-field">
          Original Price ($)
          <input
            type="number"
            min="0"
            step="0.01"
            value={form.originalPrice}
            onChange={(event) => update("originalPrice", event.target.value)}
            placeholder="99.99"
          />
        </label>

        <label className="auth-field">
          Discount Percentage (%)
          <input
            type="number"
            min="0"
            max="100"
            value={form.discountPercent}
            onChange={(event) => update("discountPercent", event.target.value)}
          />
        </label>

        <label className="auth-field">
          Selling Price (auto)
          <input
            type="text"
            value={sellingPrice === "" ? "" : money(sellingPrice)}
            readOnly
            className="readonly-input"
          />
        </label>
      </div>

      <div className="auth-row">
        <label className="auth-field">
          Category
          <select
            value={form.category}
            onChange={(event) => update("category", event.target.value)}
          >
            {CATEGORY_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label className="auth-field">
          Inventory Stock
          <select
            value={form.stockStatus}
            onChange={(event) => update("stockStatus", event.target.value)}
          >
            <option value="in_stock">In Stock</option>
            <option value="out_stock">Out of Stock</option>
          </select>
        </label>
      </div>

      <label className="auth-field">
        Available Sizes (comma separated)
        <input
          type="text"
          value={form.sizes}
          onChange={(event) => update("sizes", event.target.value)}
          placeholder="XS, S, M, L, XL, XXL"
        />
      </label>

      <section className="item-image-section">
        <h3>Product Image</h3>

        <div className="image-mode-tabs">
          <button
            type="button"
            className={imageMode === "url" ? "active" : ""}
            onClick={() => setImageMode("url")}
          >
            Image Link / URL
          </button>
          <button
            type="button"
            className={imageMode === "file" ? "active" : ""}
            onClick={() => setImageMode("file")}
          >
            Direct File Upload
          </button>
        </div>

        {imageMode === "url" ? (
          <label className="auth-field">
            Image URL
            <input
              type="url"
              value={form.image}
              onChange={(event) => update("image", event.target.value)}
              placeholder="https://res.cloudinary.com/..."
            />
          </label>
        ) : (
          <label className="auth-field">
            Upload Image File
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
            />
          </label>
        )}

        {uploading && <p className="uploading-note">Uploading image...</p>}

        {form.image && (
          <div className="image-preview">
            <p>Image Preview</p>
            <img src={form.image} alt="Product preview" />
          </div>
        )}
      </section>

      <button
        type="submit"
        className="btn-primary"
        disabled={busy || uploading}
      >
        {busy ? "Saving..." : submitLabel}
      </button>
    </form>
  );
}